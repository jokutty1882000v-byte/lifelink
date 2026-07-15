import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

/**
 * Public read-only façade over AuthService for feature components.
 * Keeps components from importing the service directly, so we can swap the
 * underlying implementation (e.g. add NgRx) without touching UI code.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly auth = inject(AuthService);

  readonly user            = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isAdmin         = this.auth.isAdmin;

  readonly displayName = computed(() => this.user()?.fullName ?? 'Guest');

  logout(): void { this.auth.logout(); }
}
