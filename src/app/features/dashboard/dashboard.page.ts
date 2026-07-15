import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '@state/auth.store';

@Component({
  selector: 'll-dashboard-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-6xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-bold">Hello, {{ auth.displayName() }} 👋</h1>
        <p class="text-sm text-gray-500">What would you like to do today?</p>
      </header>

      <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
        @for (a of actions; track a.path) {
          <a [routerLink]="a.path" class="no-underline">
            <mat-card class="!rounded-2xl hover:!shadow-md transition-shadow">
              <mat-card-content class="!p-4 flex flex-col items-start gap-2">
                <div class="w-10 h-10 rounded-xl bg-blood-100 dark:bg-blood-900/40 text-blood-700 dark:text-blood-200 flex items-center justify-center">
                  <mat-icon>{{ a.icon }}</mat-icon>
                </div>
                <div class="font-medium">{{ a.label }}</div>
                <div class="text-xs text-gray-500">{{ a.sub }}</div>
              </mat-card-content>
            </mat-card>
          </a>
        }
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold mb-3">Quick stats</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          @for (s of stats; track s.label) {
            <mat-card class="!rounded-2xl">
              <mat-card-content class="!p-4">
                <div class="text-xs text-gray-500">{{ s.label }}</div>
                <div class="text-2xl font-bold text-blood-700 mt-1">{{ s.value }}</div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>
    </div>
  `,
})
export class DashboardPage {
  readonly auth = inject(AuthStore);
  readonly actions = [
    { path: '/search',      icon: 'search',         label: 'Find Donors',   sub: 'AI-ranked matches' },
    { path: '/request',     icon: 'bloodtype',      label: 'New Request',   sub: 'Broadcast to donors' },
    { path: '/hospitals',   icon: 'local_hospital', label: 'Hospitals',     sub: 'Nearby & 24×7' },
    { path: '/ai-chat',     icon: 'smart_toy',      label: 'AI Assistant',  sub: 'Ask anything' },
  ];
  readonly stats = [
    { label: 'Donors nearby',   value: '128' },
    { label: 'Open requests',   value: '5' },
    { label: 'Your donations',  value: '3' },
    { label: 'Lives touched',   value: '9' },
  ];
}
