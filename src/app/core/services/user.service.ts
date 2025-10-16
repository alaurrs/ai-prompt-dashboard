import {DestroyRef, effect, inject, Injectable, runInInjectionContext, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';
import {catchError, of} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface UserProfile {
  email: string;
  displayName: string;
  avatarUrl?: string;
}

@Injectable({providedIn: 'root'})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);


  readonly user = signal<UserProfile | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const token = this.auth.accessToken();
      if (!token) { this.user.set(null); return; }

      this.http.get<UserProfile>('/users/me')
        .pipe(
          takeUntilDestroyed(destroyRef),
          catchError(() => { this.auth.clear(); return of(null); })
        )
        .subscribe(me => this.user.set(me));
    });
  }
}
