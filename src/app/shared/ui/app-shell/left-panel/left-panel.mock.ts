import { LeftPanelNavItem, LeftPanelThreadItem, LeftPanelUser } from './left-panel.types';

export const MOCK_LEFT_PANEL_USER: LeftPanelUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: undefined,
};

export const MOCK_LEFT_PANEL_NAV: LeftPanelNavItem[] = [
  { key: 'threads', label: 'Threads', icon: 'pi pi-comments', active: true },
  { key: 'prompts', label: 'Prompts', icon: 'pi pi-bulb' },
  { key: 'settings', label: 'Settings', icon: 'pi pi-cog' },
];

export const MOCK_LEFT_PANEL_THREADS: LeftPanelThreadItem[] = [
  { id: 't1', title: 'Welcome', snippet: 'Hello! How can I help?', updatedAt: Date.now(), unread: false },
  { id: 't2', title: 'Daily summary', snippet: 'Summarize updates…', updatedAt: Date.now() - 86400000, unread: true },
];

