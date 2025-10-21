export type LeftPanelNavKey = 'threads' | 'prompts' | 'settings';

export interface LeftPanelUser {
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface LeftPanelNavItem {
  key: LeftPanelNavKey;
  label: string;
  icon: string;
  active?: boolean;
}

export interface LeftPanelThreadItem {
  id: string;
  title: string;
  titleSource?: 'ai' | 'user';
  snippet?: string;
  updatedAt?: number | string;
  unread?: boolean;
  avatarUrl?: string;
}

