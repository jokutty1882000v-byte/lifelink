import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { AppNotification } from '../models/notification.model';
import { ApiService } from './api.service';

/**
 * Notifications feed. Backed by a WebSocket in production (push-driven),
 * mocked from JSON in dev. Exposes signals so the bell badge updates reactively.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api  = inject(ApiService);
  private readonly http = inject(HttpClient);

  private ws: WebSocket | null = null;
  private readonly incoming$ = new Subject<AppNotification>();

  private readonly _items = signal<AppNotification[]>([]);
  readonly items       = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  load(): Observable<AppNotification[]> {
    const src = environment.useMockApi
      ? this.http.get<AppNotification[]>('assets/mock/notifications.json')
      : this.api.get<AppNotification[]>(API.notifications.root);
    return src.pipe(tap((list) => this._items.set(list)));
  }

  markAsRead(id: string): Observable<void> {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    return environment.useMockApi
      ? new Observable<void>((s) => { s.next(); s.complete(); })
      : this.api.post<void>(API.notifications.markRead(id));
  }

  markAllAsRead(): Observable<void> {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
    return environment.useMockApi
      ? new Observable<void>((s) => { s.next(); s.complete(); })
      : this.api.post<void>(API.notifications.markAll);
  }

  /** Connect a persistent WebSocket that pushes new notifications. No-op in mock mode. */
  connect(token: string): void {
    if (environment.useMockApi || this.ws) return;
    this.ws = new WebSocket(`${environment.wsBaseUrl}/notifications?token=${encodeURIComponent(token)}`);
    this.ws.onmessage = (evt) => {
      try {
        const n: AppNotification = JSON.parse(evt.data);
        this._items.update((list) => [n, ...list]);
        this.incoming$.next(n);
      } catch { /* ignore malformed frame */ }
    };
    this.ws.onclose = () => { this.ws = null; };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  onIncoming(): Observable<AppNotification> {
    return this.incoming$.asObservable();
  }

  /** Public entry-point used by RealtimeService (and tests) to inject a push
   *  without needing a live WebSocket — keeps mock mode indistinguishable from live. */
  pushIncoming(n: AppNotification): void {
    this._items.update((list) => [n, ...list]);
    this.incoming$.next(n);
  }
}
