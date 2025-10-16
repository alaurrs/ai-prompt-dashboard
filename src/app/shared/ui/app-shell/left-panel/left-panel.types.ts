export type LeftPanelNavKey = 'threads' | 'prompts' | 'settings';

export interface LeftPanelUser {
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface LeftPanelNavItem {
  key: LeftPanelNavKey;
  label: string;
  icon: string; // e.g., 'pi pi-comments'
  active?: boolean;
}

export interface LeftPanelThreadItem {
  id: string;
  title: string;
  snippet?: string;
  updatedAt?: number | string; // epoch ms or preformatted string
  unread?: boolean;
  avatarUrl?: string;
}

