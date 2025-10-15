import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Toolbar} from 'primeng/toolbar';
import {Button} from 'primeng/button';
import {ThemeService} from '../../../core/services/theme.service';
import {RouterLink} from '@angular/router';

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
}
