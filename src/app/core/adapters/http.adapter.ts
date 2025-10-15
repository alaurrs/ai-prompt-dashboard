import {HttpClient, HttpContextToken, HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {environment} from '../../../environment/environment.local';
import {AuthService} from '../services/auth.service';
import {inject} from '@angular/core';
import {catchError, firstValueFrom, switchMap, throwError} from 'rxjs';

const RETRIED = new HttpContextToken<boolean>(() => false);

export const baseHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);

  const apiBase = environment.apiBase.replace(/\/$/, '');
  const url = req.url.startsWith('http')
    ? req.url
    : `${apiBase}/${req.url.replace(/^\//, '')}`;

  const access = auth.accessToken();
  const withAuth = access ? req.clone({ url, setHeaders: { Authorization: `Bearer ${access}`}}) : req.clone({ url });

  return next(withAuth).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      if (req.context.get(RETRIED)) {
        auth.clear();
        return throwError(() => err);
      }

      const refresh = auth.refreshToken?.() ?? null;
      if (!refresh) {
        auth.clear();
        return throwError(() => err);
      }

      return http.post<{ accessToken: string; refreshToken?: string}>(
        `${apiBase}/auth/refresh`,
        { refreshToken: refresh}
      ).pipe(
        switchMap(tokens => {
          auth.setTokens(tokens.accessToken, tokens.refreshToken ?? refresh);
          const retried = withAuth.clone({
            setHeaders: { Authorization: `Bearer ${tokens.accessToken}`},
            context: req.context.set(RETRIED, true),
          });
          return next(retried);
        }),
        catchError(refreshErr => {
          auth.clear();
          return throwError(() => refreshErr);
        })
      )
    })
  )
};
