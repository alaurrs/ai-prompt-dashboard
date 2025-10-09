import {ChatAdapter} from './adapter.types';
import {Injectable} from '@angular/core';
import {ChatRequest} from '../models/chat-request.model';


@Injectable({providedIn: 'root'})
export class MockAdapter implements ChatAdapter {
  async listModels(): Promise<string[]> {
    return ['mock-mini', 'mock-chat-pro'];
  }

  async *streamChat({ messages}: ChatRequest): AsyncIterable<string> {
    const lastUserMsg = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    const reply = `Réponse simulée : ${lastUserMsg.slice(0, 200)} ...`;
    for (const token of reply.split('')) {
      await new Promise(resolve => setTimeout(resolve, 35));
      yield token + '';
    }
  }
}
