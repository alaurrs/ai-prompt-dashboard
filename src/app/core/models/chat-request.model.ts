import {ChatMessageInput} from './chat-message-input.model';

export interface ChatRequest {
  model: string;
  system?: string;
  messages: ChatMessageInput[];
}
