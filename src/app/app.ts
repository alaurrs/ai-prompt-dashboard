import { Component, inject, signal } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ai-prompt-dashboard');
  // Ensure ThemeService initializes early to prevent FOUC
  private readonly _theme = inject(ThemeService);
}
