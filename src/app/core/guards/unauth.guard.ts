import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanMatch, Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {AuthService} from '../services/auth.service';

@Injectable({ providedIn: 'root'})
export class UnauthGuard implements CanActivate, CanMatch {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private check(): boolean | UrlTree {
    return this.auth.isAuthenticated() ? this.router.parseUrl('/') : true;
  }

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.check();
  }

  canMatch(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.check();
  }
}
