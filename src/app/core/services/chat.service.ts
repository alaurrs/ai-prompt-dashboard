import {computed, Injectable, signal} from '@angular/core';
import {ChatThread} from '../models/chat-thread.model';
import {StorageService} from './storage.service';
import {ChatMessage} from '../models/chat-message.model';
import {ChatAdapter} from '../adapters/adapter.types';
import {MockAdapter} from '../adapters/mock.adapter';
import {ThreadDto, ThreadsAdapter} from '../adapters/threads.adapter';
import {MessageDto, MessagesAdapter} from '../adapters/messages.adapter';
import {AiSseAdapter} from '../adapters/ai-sse.adapter';
import {first, firstValueFrom} from 'rxjs';

function uid(): string {
  return crypto.randomUUID();
}

@Injectable({providedIn: 'root'})
export class ChatService {
  readonly threads = signal<ChatThread[]>([]);
  readonly activeId = signal<string | null>(null);

  readonly active = computed<ChatThread | null>(() =>
    this.threads().find(t => t.id === this.activeId()) ?? null
  );

  readonly streaming = signal<boolean>(false);

  private cancelStreaming: (() => void) | null = null;

  private stopFlag = false;

  constructor(
    private readonly storage: StorageService,
    private readonly threadsApi: ThreadsAdapter,
    private readonly messagesApi: MessagesAdapter,
    private readonly aiSse: AiSseAdapter,
  ) {
    this.bootstrap();
  }

  private async bootstrap() {
    try {
      const page = await firstValueFrom(this.threadsApi.list({limit: 20}));
      const items = (page?.items ?? []).map(this.toChatThread);
      this.threads.set(items);
      if (items.length) this.activeId.set(items[0].id);
      else this.activeId.set(null);
      this.persistCache();
    } catch {
      const cached = this.storage.loadThreads();
      this.threads.set(cached);
      if (cached.length) this.activeId.set(cached[0].id);
    }
  }

  listThreads(): ChatThread[] {
    return this.threads();
  }

  isStreaming(): boolean {
    return this.streaming();
  }

  // --------- THREAD COMMANDS ----------
  async newThread(title = 'New conversation', providerId: ChatThread['providerId'] = 'mock', model = 'o4-mini'): Promise<void> {
    const dto = await firstValueFrom(this.threadsApi.create({ title, model }));
    const thread = this.toChatThread(dto!);
    this.threads.set([thread, ...this.threads()]);
    this.activeId.set(thread.id);
    this.persistCache();
  }


  async open(threadId: string): Promise<void> {
    let local = this.threadById(threadId);
    if (!local) {
      const dto = await firstValueFrom(this.threadsApi.get(threadId));
      if (!dto) return;
      local = this.toChatThread(dto);
      this.threads.set([local, ...this.threads()]);
    }
    await this.hydrateMessages(threadId);
    this.activeId.set(threadId);
    this.persistCache();
  }

  async rename(threadId: string, title: string): Promise<void> {
    const current = this.threadById(threadId);
    if (!current) return;
    const dto = await firstValueFrom(this.threadsApi.patch(threadId, { title, version: current.version }));
    if (!dto) return;
    this.patchThread(threadId, this.toChatThread(dto));
  }

  async remove(threadId: string): Promise<void> {
    const current = this.threadById(threadId);
    if (!current) return;
    const dto = await firstValueFrom(this.threadsApi.patch(threadId, { status: 'deleted', version: current.version}));
    const next = this.threads().filter(t => t.id !== threadId);
    this.threads.set(next);
    if (this.activeId() === threadId) this.activeId.set(next[0]?.id ?? null);
    this.persistCache();
  }

  setProvider(threadId: string, providerId: ChatThread['providerId'], model: string): void {
    this.patchThread(threadId, { providerId, model, updatedAt: Date.now()});
  }

  async setSystemPrompt(threadId: string, systemPrompt: string | undefined): Promise<void> {
    const current = this.threadById(threadId);
    if (!current) return;
    const dto = await firstValueFrom(this.threadsApi.patch(threadId, { systemPrompt, version: current.version }));
    if (!dto) return;
    this.patchThread(threadId, this.toChatThread(dto));
  }

  // ------- INTERNAL : STREAMING -------
  private async streamAssistant(thread: ChatThread, prompt: string) {
    const assistantLocalId = uid();
    const assistant: ChatMessage = { id: assistantLocalId, role: 'assistant', content: '', createdAt: Date.now() };
    this.appendMessage(thread.id, assistant);
    this.streaming.set(true);

    const { stream, cancel } = this.aiSse.respond(thread.id, {
      prompt,
      model: thread.model,
      systemPrompt: thread.systemPrompt ?? undefined,
    });
    this.cancelStreaming = cancel;

    try {
      const reader = stream.getReader();
      let assistantServerId: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        if (value.type === 'created') {
          assistantServerId = value.data;
        } else if (value.type === 'token') {
          this.mutateMessage(thread.id, assistantLocalId, prev => prev + value.data);
        } else if (value.type === 'done') {
          this.mutateMessage(thread.id, assistantLocalId, prev => prev);
          this.streaming.set(false);
        }
      }
    } catch (e: any) {
      const msg = (e?.data ?? e?.message ?? 'Stream error').toString();
      this.mutateMessage(thread.id, assistantLocalId, prev => prev, msg);
      this.streaming.set(false);
    } finally {
      this.cancelStreaming = null;
      this.persistCache();
      await this.hydrateMessages(thread.id);
    }
  }

  // ------ MESSAGE COMMANDS ------

  async sendUserMessage(text: string): Promise<void> {
    const thread = this.active();
    if (!thread) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const clientMessageId = uid();
    const userMsgDto = await firstValueFrom(this.messagesApi.createUser(thread.id, trimmed, clientMessageId));

    const userMsg = this.toChatMessage(userMsgDto!);
    this.appendMessage(thread.id, userMsg);

    await this.streamAssistant(thread, trimmed);
  }

  async retry(): Promise<void> {
    const thread = this.active();
    if (!thread || !thread.messages.length) return;
    const lastUser = [...thread.messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    await this.streamAssistant(thread, lastUser.content);
  }

  stop(): void {
    if (this.cancelStreaming) this.cancelStreaming();
    this.streaming.set(false);
  }

  // ------- MUTATION HELPERS -------
  private appendMessage(threadId: string, msg: ChatMessage): void {
    const t = this.threadById(threadId);
    if (!t) return;
    this.patchThread(threadId, { messages: [...t.messages, msg], updatedAt: Date.now() });
  }

  private patchThread(threadId: string, patch: Partial<ChatThread> | ChatThread): void {
    const updated = this.threads().map(t => (t.id === threadId
        ? { ...t, ...patch, updatedAt: ('updatedAt' in patch && patch.updatedAt) ? patch.updatedAt : Date.now() }
        : t
    ));
    this.threads.set(updated);
    this.persistCache();
  }

  private mutateMessage(
    threadId: string,
    messageId: string,
    updater: (prev: string) => string,
    error?: string
  ): void {
    const updated = this.threads().map(t => {
      if (t.id !== threadId) return t;
      return {
        ...t,
        messages: t.messages.map(m =>
          m.id === messageId ? { ...m, content: updater(m.content), error } : m
        ),
        updatedAt: Date.now(),
      };
    });
    this.threads.set(updated);
  }

  private threadById(id: string): ChatThread | undefined {
    return this.threads().find(t => t.id === id);
  }

  private persistCache(): void {
    this.storage.saveThreads(this.threads());
  }

  // ------- HELPERS -------
  private async hydrateMessages(threadId: string) {
    const list = await firstValueFrom(this.messagesApi.list(threadId, {afterPosition: -1, limit: 200}));
    const msgs = (list ?? []).map(this.toChatMessage);
    this.patchThread(threadId, { messages: msgs, updatedAt: Date.now() });
  }

  private toChatMessage = (m: MessageDto): ChatMessage => ({
    id: m.id,
    role: (m.author as any) ?? 'assistant',
    content: m.content ?? '',
    createdAt: new Date(m.createdAt).getTime(),
    error: m.status === 'error' ? (m as any).errorMessage ?? 'error' : undefined,
  });

  private toChatThread = (dto: ThreadDto): ChatThread => ({
    id: dto.id,
    title: dto.title ?? 'Untitled',
    providerId: 'server',
    model: dto.model ?? 'o4-mini',
    systemPrompt: dto.systemPrompt ?? undefined,
    messages: [],
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
    version: dto.version as any,
  });
}
