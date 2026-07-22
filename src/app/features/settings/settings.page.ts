import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeService } from '@core/services/theme.service';
import { PushNotificationService } from '@core/services/push-notification.service';

@Component({
  selector: 'll-settings-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonToggleModule, MatSlideToggleModule, MatButtonModule, MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold">Settings</h1>

      <mat-card class="!rounded-2xl">
        <mat-card-content class="!p-6">
          <h2 class="font-medium mb-3">Appearance</h2>
          <mat-button-toggle-group [value]="theme.mode()" (change)="theme.set($event.value)">
            <mat-button-toggle value="light">Light</mat-button-toggle>
            <mat-button-toggle value="dark">Dark</mat-button-toggle>
            <mat-button-toggle value="system">System</mat-button-toggle>
          </mat-button-toggle-group>
        </mat-card-content>
      </mat-card>

      <mat-card class="!rounded-2xl">
        <mat-card-content class="!p-6">
          <h2 class="font-medium mb-1">Push notifications</h2>
          <p class="text-sm text-gray-500 mb-3">
            Get an OS-level toast when a matching donor appears or an emergency is broadcast.
          </p>

          @switch (push.permission()) {
            @case ('granted') {
              <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <mat-icon>check_circle</mat-icon> Enabled
              </div>
            }
            @case ('denied') {
              <div class="flex items-center gap-2 text-red-700 dark:text-red-300">
                <mat-icon>block</mat-icon>
                Blocked in browser settings. Reset the site permission to re-enable.
              </div>
            }
            @case ('unsupported') {
              <div class="text-gray-500 text-sm">Not supported by this browser.</div>
            }
            @default {
              <button mat-flat-button color="warn" (click)="enable()">
                <mat-icon>notifications_active</mat-icon> Enable notifications
              </button>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SettingsPage {
  readonly theme = inject(ThemeService);
  readonly push  = inject(PushNotificationService);
  private readonly snack = inject(MatSnackBar);

  async enable(): Promise<void> {
    const result = await this.push.request();
    if (result === 'granted') {
      this.push.show('LifeLink notifications enabled', {
        body: 'You will get an alert on emergencies and donor matches.',
      });
    } else if (result === 'denied') {
      this.snack.open('Permission denied — enable it from the browser address bar.', 'Dismiss', { duration: 5000 });
    }
  }
}
