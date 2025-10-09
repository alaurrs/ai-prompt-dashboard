import {ChatMessage} from './chat-message.model';

export interface ChatThread {
  id: string;
  title: string;
  providerId: 'mock' | 'openai' | 'custom';
  model: string;
  systemPrompt?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
