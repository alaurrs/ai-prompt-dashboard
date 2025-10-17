import {ChangeDetectionStrategy, Component, computed, inject, signal, ViewEncapsulation} from '@angular/core';
import {AppShell} from '../../shared/ui/app-shell/app-shell.component';
import {Button} from 'primeng/button';
import {ChatService} from '../../core/services/chat.service';
import {RouterLink} from '@angular/router';
import {Textarea} from 'primeng/textarea';
import {FormsModule} from '@angular/forms';
import {Avatar} from 'primeng/avatar';
import { LeftPanelComponent } from '../../shared/ui/app-shell/left-panel/left-panel.component';
import { LeftPanelNavItem, LeftPanelThreadItem, LeftPanelUser } from '../../shared/ui/app-shell/left-panel/left-panel.types';
import { RightPanelComponent } from '../prompts/right-panel/right-panel.component';
import { Router } from '@angular/router';
import {AutoScrollDirective} from '../../shared/directives/auto-scroll.directive';

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    AppShell,
    Button,
    Textarea,
    FormsModule,
    LeftPanelComponent,
    RightPanelComponent,
    AutoScrollDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPage {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);

  readonly threads = this.chat.threads;
  readonly active = this.chat.active;
  readonly busy = this.chat.streaming;
  readonly isWaitingFirstChunk = this.chat.waitingFirstChunk;

  text = '';
  private readonly searchQuery = signal('');

  // Left panel bindings
  readonly user: LeftPanelUser = { name: 'John Doe', email: 'john@example.com' };
  private readonly selectedNav = signal<'threads'|'prompts'|'settings'>('threads');
  readonly nav = computed<LeftPanelNavItem[]>(() => {
    const sel = this.selectedNav();
    const promptsActive = sel === 'prompts';
    return [
      {
        key: 'threads',
        label: 'Threads',
        icon: 'pi pi-comments',
        active: sel === 'threads' || promptsActive,
      },
      {
        key: 'prompts',
        label: 'Prompts',
        icon: 'pi pi-bulb',
        active: promptsActive,
      },
      { key: 'settings', label: 'Settings', icon: 'pi pi-cog', active: false },
    ];
  });
  readonly threadItems = computed<LeftPanelThreadItem[]>(() => {
    const list = this.threads();
    const q = this.searchQuery().trim().toLowerCase();
    const filtered = !q
      ? list
      : list.filter(t => {
          const inTitle = t.title?.toLowerCase().includes(q);
          const inMessages = t.messages?.some(m => m.content?.toLowerCase().includes(q));
          return inTitle || inMessages;
        });
    return filtered.map(t => {
      const last = t.messages[t.messages.length - 1];
      return {
        id: t.id,
        title: t.title,
        snippet: last?.content,
        updatedAt: t.updatedAt,
        unread: false,
      } satisfies LeftPanelThreadItem;
    });
  });

  // Right panel (Prompts) state and data
  readonly showPrompts = signal(false);

  readonly isStreaming = computed(() => this.chat.streaming());

  newThread() { this.chat.newThread(); }
  open(id: string) { this.chat.open(id); }
  stop() { this.chat.stop(); }
  send() {
    if (!this.text.trim() || !this.active()) return;

    if (this.busy()) this.chat.stop();

    const value = this.text.trim();
    if (!value) return;
    this.chat.sendUserMessage(value);
    this.text = '';
  }

  trackById = (_: number, it: { id: string}) => it.id;

  onSelectNav(key: 'threads' | 'prompts' | 'settings') {
    if (key === 'settings') {
      this.router.navigateByUrl('/settings').catch(() => {});
      return;
    }
    if (key === 'prompts') {
      const next = !this.showPrompts();
      this.showPrompts.set(next);
      this.selectedNav.set(next ? 'prompts' : 'threads');
      return;
    }
    this.selectedNav.set('threads');
  }
  onSearch(q: string) {
    this.searchQuery.set(q ?? '');
  }
}
