import {Injectable} from '@angular/core';
import {ChatThread} from '../models/chat-thread.model';
import {AppSettings} from '../models/app-settings.model';
import {PromptTemplate} from '../models/prompt-template.model';

@Injectable({providedIn: 'root'})
export class StorageService {
  private readonly KEYS = {
    threads: 'apd:threads:v1',
    settings: 'apd:settings:v1',
    prompts: 'apd:prompts:v1'
  }

  private read<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      console.warn(`StorageService: failed to parse key ${key}`);
      return null;
    }
  }

  private write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch(err) {
      console.error(`StorageService: failed to save key ${key}`, err);
    }
  }

  private remove(key: string): void {
    localStorage.removeItem(key);
  }

  // ---------- THREADS ----------

  loadThreads(): ChatThread[] {
    return this.read<ChatThread[]>(this.KEYS.threads) ?? [];
  }

  saveThreads(threads: ChatThread[]): void {
    this.write(this.KEYS.threads, threads);
  }

  clearThreads(): void {
    this.remove(this.KEYS.threads);
  }

  // ---------- SETTINGS ----------
  loadSettings(): AppSettings {
    return this.read<AppSettings>(this.KEYS.settings) ?? { providers: [], theme: 'light'};
  }

  saveSettings(settings: AppSettings): void {
    this.write(this.KEYS.settings, settings);
  }

  clearSettings(): void {
    this.remove(this.KEYS.settings);
  }

  // ---------- PROMPTS ----------
  loadPrompts(): PromptTemplate[] {
    return this.read<PromptTemplate[]>(this.KEYS.prompts) ?? [];
  }

  savePrompts(prompts: PromptTemplate[]): void {
    this.write(this.KEYS.prompts, prompts);
  }

  clearPrompts(): void {
    this.remove(this.KEYS.prompts);
  }


  // ---------- UTILS ----------
  clearAll(): void {
    Object.values(this.KEYS).forEach((key) => localStorage.removeItem(key));
  }
}
