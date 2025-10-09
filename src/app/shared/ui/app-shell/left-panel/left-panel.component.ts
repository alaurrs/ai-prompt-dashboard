import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar } from 'primeng/avatar';
import { InputText } from 'primeng/inputtext';
import { LeftPanelNavItem, LeftPanelNavKey, LeftPanelThreadItem, LeftPanelUser } from './left-panel.types';

@Component({
  standalone: true,
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss',
  imports: [NgIf, DatePipe, FormsModule, Avatar, InputText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftPanelComponent {
  @Input() user!: LeftPanelUser;
  @Input() nav: LeftPanelNavItem[] = [];
  @Input() threads: LeftPanelThreadItem[] = [];
  @Input() selectedThreadId?: string;

  @Output() selectNav = new EventEmitter<LeftPanelNavKey>();
  @Output() newChat = new EventEmitter<void>();
  @Output() openThread = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  query = '';

  onNav(it: LeftPanelNavItem) {
    this.selectNav.emit(it.key);
  }

  onOpenThread(id: string) {
    this.openThread.emit(id);
  }

  // Normalize input event to string value for parent consumers
  onSearchEvent(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    // keep local input state in sync so the text doesn't reset
    this.query = value;
    this.search.emit(value);
  }
}
