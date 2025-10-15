import {Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../core/services/auth.service';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  standalone: true,
  imports: [
    FormsModule
  ]
})
export class LoginPage {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = signal('');
  password = signal('');
  busy = signal(false);
  error = signal<string | null>(null);

  async submit() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);

    try {
      const res = await firstValueFrom(
        this.http.post<{ accessToken: string; refreshToken?: string; tokenType?: string; expiresIn?: number; }>(
          `${environment.apiBase}/auth/login`,
          { email: this.email(), password: this.password() }
        )
      );

      this.auth.setTokens(res.accessToken, res.refreshToken ?? null);
      this.router.navigateByUrl('/').catch(() => {});
    } catch {
      this.error.set('Invalid email or password');
    } finally {
      this.busy.set(false);
    }
  }
}
