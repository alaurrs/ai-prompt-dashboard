import {ChatRequest} from '../models/chat-request.model';

export interface ChatAdapter {
  listModels(): Promise<string[]>;

  streamChat(input: ChatRequest): AsyncIterable<string>;
}
