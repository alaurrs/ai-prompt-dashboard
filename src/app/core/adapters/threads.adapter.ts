import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

export interface ThreadDto {
  id: string;
  title: string;
  model: string;
  status: string;
  systemPrompt?: string|null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PageDto<T> {
  items: T[];
  nextCursor?: string | null;
}


@Injectable({providedIn: 'root'})
export class ThreadsAdapter {
  constructor(private http: HttpClient) {
  }

  create(body: Partial<Pick<ThreadDto, 'title'|'model'|'systemPrompt'>>) {
    return this.http.post<ThreadDto>('/threads', body);
  }

  list(params?: {limit?: number; cursor?: string}) {
    let p = new HttpParams();
    if (params?.limit) p = p.set('limit', params.limit);
    if (params?.cursor) p = p.set('cursor', params.cursor);
    return this.http.get<PageDto<ThreadDto>>('/threads', {params: p});
  }


  patch(id: string, body: Partial<Pick<ThreadDto,'title'|'status'|'model'|'systemPrompt'|'version'>>) {
    return this.http.patch<ThreadDto>(`/threads/${id}`, body);
  }

  get(id: string) {
    return this.http.get<ThreadDto>(`/threads/${id}`);
  }}
