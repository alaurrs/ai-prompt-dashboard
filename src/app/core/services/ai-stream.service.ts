import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export type AiStreamEvent = { type: 'token' | 'done' | 'error'; data: string };

export interface AiStreamHandle {
  stream$: Observable<AiStreamEvent>;
  stop(): void;
}

@Injectable({ providedIn: 'root' })
export class AiStreamService {
  private readonly auth = inject(AuthService);
  private readonly apiBase = environment.apiBase.replace(/\/$/, '');

  startRespond(
    threadId: string,
    params: { prompt?: string; model?: string; systemPrompt?: string }
  ): AiStreamHandle {
    const subject = new Subject<AiStreamEvent>();

    const url = `${this.apiBase}/threads/${encodeURIComponent(threadId)}/respond`;
    const ctrl = new AbortController();
    let closed = false;
    const HEARTBEAT_MS = 30000;
    let heartbeat: any = null;

    const kick = () => {
      try { if (heartbeat) clearTimeout(heartbeat); } catch {}
      heartbeat = setTimeout(() => {
        if (closed) return;
        subject.next({ type: 'error', data: 'timeout' });
        cleanup();
      }, HEARTBEAT_MS);
    };

    const token = (this.auth as any).getAccessToken?.() ?? this.auth.accessToken();
    const headers = new Headers();
    headers.set('Accept', 'text/event-stream');
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const init: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ prompt: params?.prompt, model: params?.model, systemPrompt: params?.systemPrompt }),
      headers,
      signal: ctrl.signal,
      credentials: token ? 'same-origin' : 'include',
    };

    const cleanup = () => {
      if (closed) return;
      closed = true;
      try { if (heartbeat) clearTimeout(heartbeat); } catch {}
      heartbeat = null;
      try { ctrl.abort(); } catch {}
      subject.complete();
    };

    (async () => {
      try {
        const res = await fetch(url, init);
        if (!res.ok) {
          subject.next({ type: 'error', data: `HTTP ${res.status}` });
          cleanup();
          return;
        }
        if (!res.body) {
          subject.next({ type: 'error', data: 'No body' });
          cleanup();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        kick();

        const emit = (event: string | null, data: string) => {
          if (closed) return;
          const payload = data ?? '';
          if (event === 'token' || (!event && payload)) {
            subject.next({ type: 'token', data: payload });
          } else if (event === 'done') {
            subject.next({ type: 'done', data: payload || 'DONE' });
            cleanup();
          } else if (event === 'error') {
            subject.next({ type: 'error', data: payload || 'error' });
            cleanup();
          }
          kick();
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
            emit(eventName, dataParts.join('\n'));
          }
        }

        if (buf.trim().length) {
          let eventName: string | null = null;
          const dataParts: string[] = [];
          for (const line of buf.split('\n')) {
            if (line.startsWith('event:')) eventName = line.slice(6).trimStart();
            else if (line.startsWith('data:')) dataParts.push(line.slice(5));
          }
          emit(eventName, dataParts.join('\n'));
        }

        cleanup();
      } catch (err: any) {
        if (closed) return;
        const msg = err?.message || 'Stream error';
        subject.next({ type: 'error', data: String(msg) });
        cleanup();
      }
    })();

    return { stream$: subject.asObservable(), stop: cleanup };
  }
}
