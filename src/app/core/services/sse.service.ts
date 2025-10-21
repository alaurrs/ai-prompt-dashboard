import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { AuthFetchService } from './auth-fetch.service';
import { environment } from '../../../environments/environment';
import { ChatService } from './chat.service';

type SseStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

type TitleUpdatedPayload = {
  threadId: string;
  title: string;
  titleSource: 'ai' | 'user';
  updatedAt: string; // ISO-8601
};

@Injectable({ providedIn: 'root' })
export class SseService {
  readonly status = signal<SseStatus>('disconnected');

  private readonly auth = inject(AuthService);
  private readonly authFetch = inject(AuthFetchService);
  private readonly chat = inject(ChatService);
  private readonly apiBase = environment.apiBase.replace(/\/$/, '');

  private abortCtrl: AbortController | null = null;
  private reconnecting = false;
  private backoffMs = 1000; // start 1s
  private readonly maxBackoffMs = 30000; // cap 30s

  constructor() {
    // Auto manage lifecycle with auth state
    effect(() => {
      const authed = this.auth.isAuthenticated();
      if (authed) {
        this.ensureConnected();
      } else {
        this.disconnect();
      }
    });
  }

  ensureConnected() {
    if (this.abortCtrl) return; // already connected/connecting
    this.connect();
  }

  disconnect() {
    try { this.abortCtrl?.abort(); } catch {}
    this.abortCtrl = null;
    this.reconnecting = false;
    this.backoffMs = 1000;
    this.status.set('disconnected');
  }

  private async connect() {
    const ctrl = new AbortController();
    this.abortCtrl = ctrl;
    this.status.set(this.reconnecting ? 'reconnecting' : 'connecting');

    try {
      const res = await this.authFetch.fetch('/events', {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-store',
        },
        signal: ctrl.signal,
        // Keep cookies alignment in case backend uses them when no token
        credentials: this.auth.accessToken() ? 'same-origin' : 'include',
      });

      if (!res.ok || !res.body) {
        // Authentication may have been cleared by authFetch on 401
        if (!this.auth.isAuthenticated()) { this.disconnect(); return; }
        this.scheduleReconnect();
        return;
      }

      this.status.set('connected');
      await this.consumeEventStream(res.body.getReader(), ctrl);
    } catch (err) {
      if (ctrl.signal.aborted) return; // intentional disconnect
      if (!this.auth.isAuthenticated()) { this.disconnect(); return; }
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    try { this.abortCtrl?.abort(); } catch {}
    this.abortCtrl = null;
    this.reconnecting = true;
    const delay = this.backoffMs;
    this.backoffMs = Math.min(this.backoffMs * 2, this.maxBackoffMs);
    this.status.set('reconnecting');
    setTimeout(() => {
      if (!this.auth.isAuthenticated()) { this.disconnect(); return; }
      this.connect();
    }, delay);
  }

  private async consumeEventStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    ctrl: AbortController,
  ) {
    const decoder = new TextDecoder();
    let buf = '';

    const dispatch = (event: string | null, data: string) => {
      if (!event) return; // ignore unnamed events
      if (event === 'connected') {
        this.status.set('connected');
        return;
      }
      if (event === 'keepalive') {
        // no-op; presence keeps connection healthy
        return;
      }
      if (event === 'thread.title_updated') {
        try {
          const payload = JSON.parse(data) as TitleUpdatedPayload;
          this.chat.applyTitleUpdateFromSse({
            threadId: payload.threadId,
            title: payload.title,
            titleSource: payload.titleSource,
            updatedAtIso: payload.updatedAt,
          });
        } catch {
          // ignore malformed payloads
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const raw = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        let eventName: string | null = null;
        const dataParts: string[] = [];
        for (const line of raw.split('\n')) {
          if (line.startsWith('event:')) eventName = line.slice(6).trimStart();
          else if (line.startsWith('data:')) dataParts.push(line.slice(5));
        }
        dispatch(eventName, dataParts.join('\n'));
      }
    }

    // flush tail
    if (buf.trim().length) {
      let eventName: string | null = null;
      const dataParts: string[] = [];
      for (const line of buf.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trimStart();
        else if (line.startsWith('data:')) dataParts.push(line.slice(5));
      }
      dispatch(eventName, dataParts.join('\n'));
    }

    // server closed normally; consider reconnecting
    if (!ctrl.signal.aborted && this.auth.isAuthenticated()) {
      this.scheduleReconnect();
    }
  }
}

