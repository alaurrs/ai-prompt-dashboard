
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
        const tokens = await firstValueFrom(
          this.http.post<{ accessToken: string; refreshToken?: string }>(
            `${this.apiBase}/auth/refresh`, { refreshToken: rt }
          )
        );
        this.auth.setTokens(tokens.accessToken, tokens.refreshToken ?? rt);
        return this.fetch(input, init, false);
      } catch {
        this.auth.clear();
        return res;
      }
    }

    return res;
  }

  private absUrl(url: string) {
    return url.startsWith('http') ? url : `${this.apiBase}/${url.replace(/^\//, '')}`;
  }
}
