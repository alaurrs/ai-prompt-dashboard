import {Role} from './role.model';

export interface ChatMessageInput {
  role: Role;
  content: string;
}
