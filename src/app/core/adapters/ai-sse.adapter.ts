// src/app/core/adapters/ai-sse.adapter.ts
import { Injectable, inject } from '@angular/core';
import { AuthFetchService } from '../services/auth-fetch.service';

type SseChunk = { type: 'created'|'token'|'done'|'error'; data?: string };

@Injectable({ providedIn: 'root' })
export class AiSseAdapter {
  private readonly authFetch = inject(AuthFetchService);

  respond(threadId: string, body: { prompt: string; model?: string; systemPrompt?: string }) {
    const abort = new AbortController();
    const authFetch = this.authFetch;

    const stream = new ReadableStream<SseChunk>({
      async start(controller) {
        const res = await authFetch.fetch(`/threads/${threadId}/respond`, {
          method: 'POST',
          body: JSON.stringify(body),
          signal: abort.signal,
        });

        if (!res.ok) {
          controller.enqueue({ type: 'error', data: `HTTP ${res.status}` });
          controller.close();
          return;
        }
        if (!res.body) { controller.error(new Error('No body')); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        const emit = (event: string, data?: string) => {
          if (event === 'token') controller.enqueue({ type: 'token', data });
          else if (event === 'created') controller.enqueue({ type: 'created', data });
          else if (event === 'done') controller.enqueue({ type: 'done' });
          else if (event === 'error') controller.enqueue({ type: 'error', data });
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
              if (line.startsWith('event:')) eventName = line.slice(6).replace(/^\s/, '');
              else if (line.startsWith('data:')) dataParts.push(line.slice(5));
            }

            if (eventName) emit(eventName, dataParts.join('\n'));
          }
        }

        controller.enqueue({ type: 'done' });
        controller.close();
      },
      cancel() { abort.abort(); }
    });

    return { stream, cancel: () => abort.abort() };
  }
}
