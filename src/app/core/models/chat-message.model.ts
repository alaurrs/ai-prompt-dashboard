import {Role} from './role.model';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  error?: string;
}
