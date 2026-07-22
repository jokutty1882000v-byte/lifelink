import { Injectable, effect, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '@env/environment';
import { AppNotification } from '../models/notification.model';
import { DonorAvailability } from '../models/donor.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { PushNotificationService } from './push-notification.service';

export interface AvailabilityUpdate {
  donorId: string;
  availability: DonorAvailability;
}

/**
 * Orchestrates the app's real-time layer:
 * - In live mode: opens the notifications WebSocket after login, closes on logout.
 * - In mock mode: emits synthetic notifications and donor availability changes on a
 *   timer so the demo actually feels alive.
 * Also fans out incoming pushes to the browser Notifications API when allowed.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly auth  = inject(AuthService);
  private readonly notif = inject(NotificationService);
  private readonly push  = inject(PushNotificationService);

  private mockTimer?: ReturnType<typeof setInterval>;
  private readonly _availability$ = new Subject<AvailabilityUpdate>();
  readonly availabilityUpdates$   = this._availability$.asObservable();

  constructor() {
    effect(() => {
      const token = this.auth.tokens()?.accessToken;
      if (token) this.start(token); else this.stop();
    });

    this.notif.onIncoming().subscribe((n) => this.push.show(n.title, { body: n.body, tag: n.id }));
  }

  private start(token: string): void {
    if (environment.useMockApi) { this.startMock(); return; }
    this.notif.connect(token);
    // TODO: subscribe to a real `donor.availability` topic once the backend exposes it.
  }

  private stop(): void {
    this.notif.disconnect();
    if (this.mockTimer) { clearInterval(this.mockTimer); this.mockTimer = undefined; }
  }

  // ---------------------------------------------------------------------------
  // Mock event source — realistic enough for demos, cheap enough to leave on.
  // ---------------------------------------------------------------------------
  private startMock(): void {
    if (this.mockTimer) return;
    this.mockTimer = setInterval(() => {
      if (Math.random() < 0.5) this.emitMockNotification();
      else this.emitMockAvailability();
    }, 30_000);
  }

  private emitMockNotification(): void {
    const groups: Array<'O+' | 'O-' | 'A+' | 'B+' | 'AB+'> = ['O+', 'O-', 'A+', 'B+', 'AB+'];
    const group = groups[Math.floor(Math.random() * groups.length)]!;
    const isEmergency = Math.random() < 0.25;
    const now = new Date().toISOString();
    const n: AppNotification = isEmergency
      ? {
          id: `n-live-${Date.now()}`, type: 'emergency_alert', severity: 'critical',
          title: `Emergency: ${group} needed`,
          body: `A patient nearby urgently needs ${group}. Tap to respond.`,
          createdAt: now, read: false,
        }
      : {
          id: `n-live-${Date.now()}`, type: 'donor_match', severity: 'info',
          title: `New ${group} donor available`,
          body: `A ${group} donor near you just marked themselves available.`,
          createdAt: now, read: false,
        };
    this.notif.pushIncoming(n);
  }

  private emitMockAvailability(): void {
    const donorIds = ['d-001', 'd-002', 'd-003', 'd-004', 'd-005', 'd-006'];
    const donorId = donorIds[Math.floor(Math.random() * donorIds.length)]!;
    const availability: DonorAvailability = Math.random() < 0.7 ? 'available' : 'unavailable';
    this._availability$.next({ donorId, availability });
  }
}
