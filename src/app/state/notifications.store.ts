import { Injectable, inject } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

/**
 * Passthrough store — NotificationService already owns the reactive state.
 * Kept as a store so components import from `@state` consistently.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly svc = inject(NotificationService);

  readonly items       = this.svc.items;
  readonly unreadCount = this.svc.unreadCount;

  load()                  { return this.svc.load(); }
  markAsRead(id: string)  { return this.svc.markAsRead(id); }
  markAllAsRead()         { return this.svc.markAllAsRead(); }
}
