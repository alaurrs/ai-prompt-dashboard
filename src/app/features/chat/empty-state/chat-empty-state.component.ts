import {Component, computed, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import {ChatComposerComponent} from '../composer/chat-composer.component';
import {UserService} from '../../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-chat-empty-state',
  templateUrl: './chat-empty-state.component.html',
  styleUrl: './chat-empty-state.component.scss',
  imports: [FormsModule, ChatComposerComponent],
})
export class ChatEmptyStateComponent {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  draft = '';

  readonly displayName = computed(() => {
    const user = this.userService.user();
    if (!user) return '';
    return user?.displayName;
  })

  constructor() {
    this.chat.clearActiveSelection();
  }

  async sendFromComposer(value: string) {
    const text = value?.trim();
    if (!text) return;
    const id = await this.chat.createThreadWithMessage(text);
    if (id) this.router.navigate(['/', id]).catch(() => {});
  }
}
