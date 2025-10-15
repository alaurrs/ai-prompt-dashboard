import {AuthService} from '../../../core/services/auth.service';
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-logout',
  template: '',
})
export class LogoutPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.auth.clear();
    this.router.navigateByUrl('/login').catch(() => {});
  }
}
