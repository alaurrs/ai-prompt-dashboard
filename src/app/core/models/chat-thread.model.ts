import {ChatMessage} from './chat-message.model';

export interface ChatThread {
  id: string;
  title: string;
  titleSource?: 'ai' | 'user';
  providerId: 'mock' | 'openai' | 'custom' | 'server';
  model: string;
  systemPrompt?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  version: number;
}
