import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Toolbar} from 'primeng/toolbar';
import {Button} from 'primeng/button';
import {ThemeService} from '../../../core/services/theme.service';

@Component({
  standalone: true,
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  imports: [
    Toolbar,
    Button
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShell {
  readonly theme = inject(ThemeService);
}
