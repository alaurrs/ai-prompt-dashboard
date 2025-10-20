import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  standalone: true,
  selector: 'app-chat-empty-state',
  templateUrl: './chat-empty-state.component.html',
  imports: [FormsModule, Button, InputText],
})
export class ChatEmptyStateComponent {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);
  draft = '';

  async startNewChat() {
    const id = await this.chat.newThread(this.draft?.trim() || undefined);
    this.router.navigate(['/', id]).catch(() => {});
  }
}
