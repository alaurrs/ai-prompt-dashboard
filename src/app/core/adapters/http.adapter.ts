import {HttpInterceptorFn} from '@angular/common/http';
import {environment} from '../../../environment/environment.local';

export const baseHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.startsWith('http') ? req.url : `${environment.apiBase}${req.url}`;
  const headers = req.headers
    .set('Content-Type', req.headers.get('Content-Type') ?? 'application/json')
    .set('X-Demo-Email', environment.demoEmail);
  return next(req.clone({url, headers}));
};
