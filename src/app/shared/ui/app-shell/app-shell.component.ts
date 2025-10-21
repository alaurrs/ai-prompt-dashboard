import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, computed} from '@angular/core';
import {Toolbar} from 'primeng/toolbar';
import {Button} from 'primeng/button';
import {ThemeService} from '../../../core/services/theme.service';
import {RouterLink} from '@angular/router';
import { SseService } from '../../../core/services/sse.service';

@Component({
  standalone: true,
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  imports: [
    Toolbar,
    Button,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShell {
  @Input() rightOpen = true;
  @Output() logout = new EventEmitter<void>();
  readonly theme = inject(ThemeService);
  private readonly sse = inject(SseService);
  readonly sseStatus = this.sse.status;
  readonly sseClass = computed(() => `sse-indicator ${this.sseStatus()}`);
}
