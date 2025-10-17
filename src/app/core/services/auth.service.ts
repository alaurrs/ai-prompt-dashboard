import {computed, Injectable, signal} from '@angular/core';

const AUTH_KEY = 'apd:auth:v1';

type AuthState = { accessToken: string | null; refreshToken: string | null; };

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly state = signal<AuthState>(this.load());
  readonly accessToken = computed(() => this.state().accessToken);
  readonly refreshToken = computed(() => this.state().refreshToken);
  readonly isAuthenticated = computed(() => !!this.state().accessToken);

  private load(): AuthState {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? (JSON.parse(raw) as AuthState) : { accessToken: null, refreshToken: null };
    } catch {
      return { accessToken: null, refreshToken: null };
    }
  }
  private save(state: AuthState) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  }

  setTokens(accessToken: string, refreshToken: string | null) {
    const next = { accessToken, refreshToken };
    this.state.set(next);
    this.save(next);
  }
  clear() {
    this.state.set({ accessToken: null, refreshToken: null });
    localStorage.removeItem(AUTH_KEY);
  }

  getAccessToken(): string | null { return this.accessToken(); }
}
