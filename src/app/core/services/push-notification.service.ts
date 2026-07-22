import { Injectable, signal } from '@angular/core';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Thin wrapper over the browser Notifications API.
 * We keep it reactive via a signal so a Settings toggle can reflect state.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly _permission = signal<PushPermission>(this.readPermission());
  readonly permission = this._permission.asReadonly();

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  async request(): Promise<PushPermission> {
    if (!this.isSupported()) return 'unsupported';
    const result = await Notification.requestPermission();
    this._permission.set(result as PushPermission);
    return result as PushPermission;
  }

  show(title: string, options?: NotificationOptions): void {
    if (!this.isSupported() || this._permission() !== 'granted') return;
    try {
      new Notification(title, { icon: '/favicon.ico', badge: '/favicon.ico', ...options });
    } catch {
      // Some browsers throw when triggered outside a user gesture — fail silent.
    }
  }

  private readPermission(): PushPermission {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as PushPermission;
  }
}
