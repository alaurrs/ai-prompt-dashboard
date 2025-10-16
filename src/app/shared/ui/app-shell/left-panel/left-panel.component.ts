import {ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar } from 'primeng/avatar';
import { InputText } from 'primeng/inputtext';
import { LeftPanelNavItem, LeftPanelNavKey, LeftPanelThreadItem, LeftPanelUser } from './left-panel.types';
import {UserService} from '../../../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss',
  imports: [NgIf, DatePipe, FormsModule, Avatar, InputText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftPanelComponent {
  @Input() nav: LeftPanelNavItem[] = [];
  @Input() threads: LeftPanelThreadItem[] = [];
  @Input() selectedThreadId?: string;

  @Output() selectNav = new EventEmitter<LeftPanelNavKey>();
  @Output() newChat = new EventEmitter<void>();
  @Output() openThread = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  private readonly userService = inject(UserService);

  readonly user = computed<LeftPanelUser | null>(() => {
    const me = this.userService.user();
    if (!me) return null;
    return {
      email: me.email,
      name: me.displayName,
      avatarUrl: me.avatarUrl,
    };
  });


  query = '';

  onNav(it: LeftPanelNavItem) {
    this.selectNav.emit(it.key);
  }

  onOpenThread(id: string) {
    this.openThread.emit(id);
  }

  onSearchEvent(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    this.query = value;
    this.search.emit(value);
  }
}
