import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanMatch, GuardResult,
  MaybeAsync, Route,
  Router,
  RouterStateSnapshot, UrlSegment,
  UrlTree
} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {AuthService} from '../services/auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate, CanMatch {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private check(): boolean | UrlTree {
    return this.auth.isAuthenticated() ? true : this.router.parseUrl('/login');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check();
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    return this.check();
  }
}
