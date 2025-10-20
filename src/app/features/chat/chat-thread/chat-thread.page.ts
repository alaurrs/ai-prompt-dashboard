
import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { AutoScrollDirective } from '../../../shared/directives/auto-scroll.directive';
import { ChatService } from '../../../core/services/chat.service';
import {ChatComposerComponent} from '../composer/chat-composer.component';

@Component({
  standalone: true,
  selector: 'app-chat-thread',
  templateUrl: './chat-thread.page.html',
  styleUrl: './chat-thread.page.scss',
  imports: [FormsModule, Textarea, Button, AutoScrollDirective, ChatComposerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatThreadPage {
  private readonly route = inject(ActivatedRoute);
  private readonly chat = inject(ChatService);

  readonly active = this.chat.active;
  readonly busy = this.chat.streaming;
  readonly isWaitingFirstChunk = this.chat.waitingFirstChunk;
  readonly isStreaming = this.chat.streaming;
  readonly followWhileStreaming = computed(() => this.isStreaming() || this.isWaitingFirstChunk());

  text = '';
  composerHeight = 80;

constructor() {
  this.route.paramMap.subscribe(pm => {
  const id = pm.get('threadId');
  if (id) this.chat.open(id);
});
}

stop() { this.chat.stop(); }
send() {
  const value = this.text.trim();
  if (!value || !this.active()) return;
  if (this.busy()) this.chat.stop();
  this.chat.sendUserMessage(value);
  this.text = '';
}
sendFromComposer(value: string) {
  if (!value?.trim() || !this.active()) return;
  if (this.busy()) this.chat.stop();
  this.chat.sendUserMessage(value.trim());
}
onComposerHeight(h: number) {
  this.composerHeight = h;
}
}
