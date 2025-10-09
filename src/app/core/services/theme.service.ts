import { Injectable, Signal, computed, effect, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly prefersDark = matchMedia('(prefers-color-scheme: dark)');

  private readonly _mode = signal<ThemeMode>('light');
  readonly mode: Signal<ThemeMode> = this._mode.asReadonly();
  readonly isDark = computed(() => this.resolveIsDark(this._mode()));

  readonly icon = computed(() => (this.isDark() ? 'pi pi-sun' : 'pi pi-moon'));
  readonly label = computed(() => (this.isDark() ? 'Light mode' : 'Dark mode'));

  // Back-compat simple boolean state if needed externally
  private dark = false;

  constructor(private readonly storage: StorageService) {
    // initialize from settings or system
    const settings = this.storage.loadSettings();
    const initial: ThemeMode = settings.theme ?? 'auto';
    this._mode.set(initial);

    // reactively apply to document and persist
    effect(() => {
      const mode = this._mode();
      this.apply(mode);
      this.dark = this.resolveIsDark(mode);
      const current = this.storage.loadSettings();
      this.storage.saveSettings({ ...current, theme: mode });
    });

    // listen to system changes when auto
    this.prefersDark.addEventListener('change', () => {
      if (this._mode() === 'auto') this.apply('auto');
    });
  }

  // Overload to support boolean or explicit mode
  set(mode: ThemeMode): void;
  set(v: boolean): void;
  set(next: ThemeMode | boolean): void {
    if (typeof next === 'boolean') {
      const v = next;
      this.dark = v;
      document.documentElement.classList.toggle('app-dark', v);
      localStorage.setItem('theme', v ? 'dark' : 'light');
      this._mode.set(v ? 'dark' : 'light');
      return;
    }
    this._mode.set(next);
  }
  toggle() { this.set(!this.dark); }

  // Optional initializer compatible with simple localStorage usage
  init() { this.set(localStorage.getItem('theme') === 'dark'); }

  private resolveIsDark(mode: ThemeMode): boolean {
    return mode === 'dark' || (mode === 'auto' && this.prefersDark.matches);
  }

  private apply(mode: ThemeMode): void {
    const root = document.documentElement;
    const dark = this.resolveIsDark(mode);
    root.classList.toggle('app-dark', dark);
  }
}
