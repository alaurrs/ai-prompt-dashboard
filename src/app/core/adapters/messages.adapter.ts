import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

export interface MessageDto {
  id: string; threadId: string; author: 'user'|'assistant'|'system';
  position: number; status: 'draft'|'streaming'|'complete'|'error';
  content?: string|null; model?: string|null;
  usagePromptTokens?: number|null; usageCompletionTokens?: number|null;
  latencyMs?: number|null; createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesAdapter {
  constructor(private http: HttpClient) {}

  list(threadId: string, params?: { afterPosition?: number; limit?: number }) {
    let p = new HttpParams();
    if (params?.afterPosition !== undefined) p = p.set('afterPosition', params.afterPosition);
    if (params?.limit) p = p.set('limit', params.limit);
    return this.http.get<MessageDto[]>(`/threads/${threadId}/messages`, { params: p });
  }

  createUser(threadId: string, content: string, clientMessageId?: string) {
    const body: any = { author: 'user', content };
    if (clientMessageId) body.clientMessageId = clientMessageId;
    return this.http.post<MessageDto>(`/threads/${threadId}/messages`, body);
  }
}
