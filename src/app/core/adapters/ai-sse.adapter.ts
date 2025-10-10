import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment.local';

@Injectable({ providedIn: 'root' })
export class AiSseAdapter {
  respond(threadId: string, body: { prompt: string; model?: string; systemPrompt?: string }) {
    const controller = new AbortController();
    const stream = new ReadableStream<{ type:'created'|'token'|'done'|'error'; data:string }>({
      async start(ctrl) {
        const res = await fetch(`${environment.apiBase}/threads/${threadId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Demo-Email': environment.demoEmail },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) { ctrl.error({ type:'error', data:`HTTP ${res.status}` }); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const chunks = buf.split('\n\n'); buf = chunks.pop() ?? '';
          for (const c of chunks) {
            const lines = c.split('\n');
            const ev = lines.find(l => l.startsWith('event:'))?.slice(6).trim();
            const dt = (lines.find(l => l.startsWith('data:'))?.slice(5) ?? '').trim();
            if (ev === 'message.created') ctrl.enqueue({ type:'created', data: dt });
            else if (ev === 'token')      ctrl.enqueue({ type:'token',   data: dt });
            else if (ev === 'done')       { ctrl.enqueue({ type:'done', data: dt }); ctrl.close(); }
            else if (ev === 'error')      { ctrl.error({ type:'error', data: dt }); }
          }
        }
      },
      cancel() { controller.abort(); }
    });
    return { stream, cancel: () => controller.abort() };
  }
}
