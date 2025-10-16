import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthFetchService {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBase.replace(/\/$/, '');

  // Single-flight promise for refresh to dedupe concurrent 401s
  private refreshing: Promise<{ accessToken: string; refreshToken?: string }> | null = null;

  async fetch(input: string, init: RequestInit = {}, retryOnce = true): Promise<Response> {
    const access = this.auth.accessToken();
    const headers = new Headers(init.headers ?? {});
    if (access) headers.set('Authorization', `Bearer ${access}`);
    if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');

    const res = await fetch(this.absUrl(input), { ...init, headers });

    if (res.status === 401 && retryOnce) {
      const rt = this.auth.refreshToken();
      if (!rt) { this.auth.clear(); return res; }

      try {
        if (!this.refreshing) {
          this.refreshing = firstValueFrom(
            this.http.post<{ accessToken: string; refreshToken?: string }>(
              `${this.apiBase}/auth/refresh`, { refreshToken: rt }
            )
          );
        }
        const tokens = await this.refreshing;
        this.auth.setTokens(tokens.accessToken, tokens.refreshToken ?? rt);
      } catch {
        this.auth.clear();
        return res;
      } finally {
        this.refreshing = null;
      }

      return this.fetch(input, init, false);
    }

    return res;
  }

  private absUrl(url: string) {
    return url.startsWith('http') ? url : `${this.apiBase}/${url.replace(/^\//, '')}`;
  }
}
