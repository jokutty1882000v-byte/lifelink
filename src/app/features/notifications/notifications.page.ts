import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsStore } from '@state/notifications.store';
import { NOTIFICATION_ICONS, SEVERITY_COLOR } from '@core/constants/notification-types';
import { NotificationType, NotificationSeverity } from '@core/models/notification.model';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'll-notifications-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TimeAgoPipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Notifications</h1>
        <button mat-button (click)="store.markAllAsRead().subscribe()">Mark all read</button>
      </div>

      @if (store.items().length === 0) {
        <ll-empty-state icon="notifications_off" title="No notifications yet" />
      } @else {
        <div class="space-y-2">
          @for (n of store.items(); track n.id) {
            <mat-card class="!rounded-2xl" [class.opacity-60]="n.read">
              <mat-card-content class="!p-4 flex items-start gap-3">
                <mat-icon [class]="colorFor(n.severity)">{{ iconFor(n.type) }}</mat-icon>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="font-medium truncate">{{ n.title }}</h3>
                    <span class="text-xs text-gray-500">{{ n.createdAt | timeAgo }}</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ n.body }}</p>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsPage implements OnInit {
  readonly store = inject(NotificationsStore);
  ngOnInit(): void { this.store.load().subscribe(); }
  iconFor(t: NotificationType): string { return NOTIFICATION_ICONS[t]; }
  colorFor(s: NotificationSeverity): string { return SEVERITY_COLOR[s]; }
}
