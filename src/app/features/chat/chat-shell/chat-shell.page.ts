import {Component, ViewEncapsulation, computed, inject, signal} from '@angular/core';
import {
  LeftPanelNavItem,
  LeftPanelThreadItem,
  LeftPanelUser
} from '../../../shared/ui/app-shell/left-panel/left-panel.types';
import {ChatService} from '../../../core/services/chat.service';
import {Router, RouterOutlet} from '@angular/router';
import {AppShell} from '../../../shared/ui/app-shell/app-shell.component';
import {LeftPanelComponent} from '../../../shared/ui/app-shell/left-panel/left-panel.component';
import {RightPanelComponent} from '../../prompts/right-panel/right-panel.component';

@Component({
  standalone: true,
  selector: 'app-chat-shell',
  templateUrl: './chat-shell.page.html',
  styleUrl: './chat-shell.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    AppShell,
    LeftPanelComponent,
    RouterOutlet,
    RightPanelComponent
  ]
})
export class ChatShellPage {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);

  // Données panel gauche
  readonly threads = this.chat.threads;
  private readonly searchQuery = signal('');
  readonly user: LeftPanelUser = { name: 'John Doe', email: 'john@example.com' };

  private readonly selectedNav = signal<'threads'|'prompts'|'settings'>('threads');
  readonly nav = computed<LeftPanelNavItem[]>(() => {
    const sel = this.selectedNav();
    const promptsActive = sel === 'prompts';
    return [
      { key: 'threads', label: 'Threads', icon: 'pi pi-comments', active: sel === 'threads' || promptsActive },
      { key: 'prompts', label: 'Prompts', icon: 'pi pi-bulb', active: promptsActive },
      { key: 'settings', label: 'Settings', icon: 'pi pi-cog', active: false },
    ];
  });

  readonly threadItems = computed<LeftPanelThreadItem[]>(() => {
    const list = this.threads();
    const q = this.searchQuery().trim().toLowerCase();
    const filtered = !q ? list : list.filter(t => {
      const inTitle = t.title?.toLowerCase().includes(q);
      const inMessages = t.messages?.some(m => m.content?.toLowerCase().includes(q));
      return inTitle || inMessages;
    });
    return filtered.map(t => {
      const last = t.messages[t.messages.length - 1];
      return { id: t.id, title: t.title, snippet: last?.content, updatedAt: t.updatedAt, unread: false };
    });
  });

  // Right (prompts) toggle
  readonly showPrompts = signal(false);
  readonly activeThreadId = () => this.chat.active()?.id ?? undefined;


  // Actions
  async newThread() {
    const id = await this.chat.newThread(); // ➜ retourne l'id (voir §4)
    this.router.navigate(['/', id]).catch(() => {});
  }
  open(id: string) {
    this.router.navigate(['/', id]).catch(() => {});
  }
  onSelectNav(key: 'threads'|'prompts'|'settings') {
    if (key === 'settings') { this.router.navigateByUrl('/settings').catch(() => {}); return; }
    if (key === 'prompts') {
      const next = !this.showPrompts(); this.showPrompts.set(next); this.selectedNav.set(next ? 'prompts' : 'threads'); return;
    }
    this.selectedNav.set('threads');
  }
  onSearch(q: string) { this.searchQuery.set(q ?? ''); }
}
