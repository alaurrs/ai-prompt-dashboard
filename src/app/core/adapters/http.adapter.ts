import {HttpClient, HttpContext, HttpContextToken, HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AuthService} from '../services/auth.service';
import {inject} from '@angular/core';
import {catchError, switchMap, throwError, shareReplay, finalize} from 'rxjs';

const RETRIED = new HttpContextToken<boolean>(() => false);

let refreshShared$: import('rxjs').Observable<{ accessToken: string; refreshToken?: string }> | null = null;

export const baseHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);

  const apiBase = environment.apiBase.replace(/\/$/, '');
  const url = req.url.startsWith('http')
    ? req.url
    : `${apiBase}/${req.url.replace(/^\//, '')}`;

  const isRefresh = url.includes('/auth/refresh');

  const access = auth.accessToken();
  const withAuth = access && !isRefresh
    ? req.clone({ url, setHeaders: { Authorization: `Bearer ${access}` } })
    : req.clone({ url });

  return next(withAuth).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (isRefresh) {
        return throwError(() => err);
      }

      if (err.status !== 401) {
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

      if (!refreshShared$) {
        refreshShared$ = http.post<{ accessToken: string; refreshToken?: string }>(
          `${apiBase}/auth/refresh`,
          { refreshToken: refresh },
          { context: new HttpContext() }
        ).pipe(
          shareReplay(1),
          finalize(() => { refreshShared$ = null; })
        );
      }

      return refreshShared$.pipe(
        switchMap(tokens => {
          auth.setTokens(tokens.accessToken, tokens.refreshToken ?? refresh);
          const retried = withAuth.clone({
            setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            context: req.context.set(RETRIED, true),
          });
          return next(retried);
        }),
        catchError(refreshErr => {
          auth.clear();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
