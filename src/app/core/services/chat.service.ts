import {computed, Injectable, signal} from '@angular/core';
import {ChatThread} from '../models/chat-thread.model';
import {StorageService} from './storage.service';
import {ChatMessage} from '../models/chat-message.model';
import {ChatAdapter} from '../adapters/adapter.types';
import {MockAdapter} from '../adapters/mock.adapter';

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

  private stopFlag = false;

  constructor(
    private readonly storage: StorageService,
    private readonly mock: MockAdapter
  ) {
    const storedThreads = this.storage.loadThreads();
    this.threads.set(storedThreads);
    if (storedThreads.length) {
      this.activeId.set(storedThreads[0].id);
    }
  }

  listThreads(): ChatThread[] {
    return this.threads();
  }

  isStreaming(): boolean {
    return this.streaming();
  }

  // --------- THREAD COMMANDS ----------
  newThread(title = 'New conversation', providerId: ChatThread['providerId'] = 'mock', model = 'mock-mini'): void {
    const now = Date.now();
    const thread: ChatThread = {
      id: uid(),
      title,
      providerId,
      model,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    this.threads.set([thread, ...this.threads()]);
    this.activeId.set(thread.id);
    this.persist();
  }

  open(threadId: string): void {
    if (this.threads().some(thread => thread.id === threadId)) {
      this.activeId.set(threadId);
    }
  }

  rename(threadId: string, title: string): void {
    this.patchThread(threadId, { title, updatedAt: Date.now()});
  }

  remove(threadId: string): void {
    const next = this.threads().filter(thread => thread.id !== threadId);
    this.threads.set(next);
    if (this.activeId() === threadId) {
      this.activeId.set(next[0]?.id ?? null);
    }
    this.persist();
  }

  setProvider(threadId: string, providerId: ChatThread['providerId'], model: string): void {
    this.patchThread(threadId, { providerId, model, updatedAt: Date.now()});
  }

  setSystemPrompt(threadId: string, systemPrompt: string | undefined): void {
    this.patchThread(threadId, { systemPrompt, updatedAt: Date.now()});
  }

  // ------ MESSAGE COMMANDS ------

  sendUserMessage(text: string): void {
    const thread = this.active();
    if (!thread) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };
    this.patchThread(thread.id, {
      messages: [...thread.messages, msg],
      updatedAt: Date.now(),
    });

    void this.generateAssistant(thread.id);
  }

  retry(): void {
    const thread = this.active();
    if (!thread || !thread.messages.length) return;
    void this.generateAssistant(thread.id);
  }

  stop(): void {
    this.stopFlag = true;
  }

  // ------- INTERNAL: ASSISTANT GENERATION -------
  private async generateAssistant(threadId: string): Promise<void> {
    const thread = this.threadById(threadId);
    if (!thread) return;

    const assistant: ChatMessage = {
      id: uid(),
      role: 'assistant',
      content: '',
      createdAt: Date.now()
    };
    this.patchThread(threadId, {
      messages: [...thread.messages, assistant],
      updatedAt: Date.now(),
    });

    const adapter = this.getAdapter(thread);
    this.streaming.set(true);
    this.stopFlag = false;

    try {
      for await (const chunk of adapter.streamChat({
        model: thread.model,
        system: thread.systemPrompt,
        messages: thread.messages.map(m => ({ role: m.role, content: m.content})),
        }
      )) {
        if (this.stopFlag) break;
        this.mutateMessage(threadId, assistant.id, prev => prev + chunk);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.mutateMessage(threadId, assistant.id, prev => prev, message);
    } finally {
      this.streaming.set(false);
      this.persist();
    }
  }

  // ------- ADAPTER ROUTING --------
  private getAdapter(thread: ChatThread): ChatAdapter {
    return this.mock;
  }

  // ------- MUTATION HELPERS -------
  private patchThread(threadId: string, patch: Partial<ChatThread>): void {
    const updated = this.threads().map(
      t => (t.id === threadId ? {...t, ...patch} : t)
    );

    this.threads.set(updated);
    this.persist();
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
      }
    })
    this.threads.set(updated);
  }

  private threadById(id: string): ChatThread | undefined {
    return this.threads().find(t => t.id === id);
  }

  private persist(): void {
    this.storage.saveThreads(this.threads());
  }
}
