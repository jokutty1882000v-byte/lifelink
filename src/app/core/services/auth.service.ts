import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { AuthSession, AuthTokens, LoginRequest, RegisterRequest } from '../interfaces/auth.interface';
import { BloodGroup } from '../models/blood-group.enum';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

/**
 * Owns the current session (user + tokens) using signals so components can read
 * `isAuthenticated()` / `currentUser()` reactively without RxJS subscriptions.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly keys = environment.storageKeys;

  private readonly _user   = signal<User | null>(this.storage.get<User>(this.keys.profile));
  private readonly _tokens = signal<AuthTokens | null>(this.readTokens());

  readonly currentUser     = this._user.asReadonly();
  readonly tokens          = this._tokens.asReadonly();
  readonly isAuthenticated = computed(() => this._tokens() !== null);
  readonly isAdmin         = computed(() => this._user()?.role === 'admin');

  login(payload: LoginRequest): Observable<AuthSession> {
    if (environment.useMockApi) return this.mockSession(payload.email, 'donor').pipe(tap((s) => this.persist(s)));
    return this.api
      .post<AuthSession, LoginRequest>(API.auth.login, payload)
      .pipe(tap((session) => this.persist(session)));
  }

  register(payload: RegisterRequest): Observable<AuthSession> {
    if (environment.useMockApi) {
      return this.mockSession(payload.email, payload.role, payload.fullName, payload.phone, payload.bloodGroup)
        .pipe(tap((s) => this.persist(s)));
    }
    return this.api
      .post<AuthSession, RegisterRequest>(API.auth.register, payload)
      .pipe(tap((session) => this.persist(session)));
  }

  refresh(): Observable<AuthTokens> {
    const refreshToken = this._tokens()?.refreshToken;
    return this.api
      .post<AuthTokens, { refreshToken: string | undefined }>(API.auth.refresh, { refreshToken })
      .pipe(tap((tokens) => this.writeTokens(tokens)));
  }

  logout(): void {
    this.storage.remove(this.keys.authToken);
    this.storage.remove(this.keys.refreshToken);
    this.storage.remove(this.keys.profile);
    this._user.set(null);
    this._tokens.set(null);
  }

  private persist(session: AuthSession): void {
    this._user.set(session.user);
    this.storage.set(this.keys.profile, session.user);
    this.writeTokens(session.tokens);
  }

  private writeTokens(tokens: AuthTokens): void {
    this._tokens.set(tokens);
    this.storage.set(this.keys.authToken, tokens.accessToken);
    this.storage.set(this.keys.refreshToken, tokens.refreshToken);
  }

  private readTokens(): AuthTokens | null {
    const accessToken  = this.storage.get<string>(this.keys.authToken);
    const refreshToken = this.storage.get<string>(this.keys.refreshToken);
    return accessToken && refreshToken ? { accessToken, refreshToken, expiresIn: 0 } : null;
  }

  private mockSession(
    email: string, role: 'donor' | 'requester' | 'admin' | 'hospital_staff' = 'donor',
    fullName?: string, phone?: string, bloodGroup?: string,
  ): Observable<AuthSession> {
    const now = new Date().toISOString();
    const user: User = {
      id: `u-${Date.now()}`,
      fullName: fullName ?? email.split('@')[0] ?? 'Demo User',
      email, phone: phone ?? '+910000000000', role,
      bloodGroup: bloodGroup as BloodGroup | undefined,
      isVerified: true, createdAt: now, updatedAt: now,
    };
    return of({
      user,
      tokens: { accessToken: `mock.${btoa(email)}`, refreshToken: 'mock.refresh', expiresIn: 3600 },
    });
  }
}
