import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { AuthStore } from '@state/auth.store';
import { NotificationsStore } from '@state/notifications.store';

/** Shell for authenticated screens: top app bar + bottom nav (mobile) / side nav (desktop). */
@Component({
  selector: 'll-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule,
    ThemeToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
      <a href="#ll-main" class="ll-skip-link">Skip to main content</a>

      <!-- Top app bar -->
      <mat-toolbar color="warn" class="!sticky top-0 z-30 !shadow-md" role="banner">
        <a routerLink="/dashboard" class="flex items-center gap-2 text-white no-underline" aria-label="Home">
          <mat-icon>bloodtype</mat-icon>
          <span class="font-semibold tracking-wide">LifeLink</span>
        </a>

        <span class="flex-1"></span>

        <a mat-icon-button routerLink="/notifications" aria-label="Notifications">
          <mat-icon [matBadge]="notif.unreadCount()" [matBadgeHidden]="!notif.unreadCount()" matBadgeColor="accent">
            notifications
          </mat-icon>
        </a>

        <ll-theme-toggle />

        <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="px-4 py-2 text-sm">
            <div class="font-medium">{{ auth.displayName() }}</div>
          </div>
          <a mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon>Profile</a>
          <a mat-menu-item routerLink="/settings"><mat-icon>settings</mat-icon>Settings</a>
          @if (auth.isAdmin()) {
            <a mat-menu-item routerLink="/admin"><mat-icon>admin_panel_settings</mat-icon>Admin</a>
          }
          <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon>Sign out</button>
        </mat-menu>
      </mat-toolbar>

      <!-- Content + desktop side rail -->
      <div class="flex flex-1 min-h-0">
        <nav class="hidden md:flex flex-col w-56 border-r bg-white dark:bg-neutral-950 dark:border-neutral-800 p-2 gap-1" aria-label="Primary">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path" routerLinkActive="!bg-blood-50 !text-blood-800 dark:!bg-blood-900/30 dark:!text-blood-100"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 no-underline"
            >
              <mat-icon class="!text-xl">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <main id="ll-main" class="flex-1 min-w-0 pb-20 md:pb-6 overflow-y-auto" tabindex="-1">
          <router-outlet />
        </main>
      </div>

      <!-- Bottom nav (mobile) -->
      <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-neutral-950 border-t dark:border-neutral-800 flex justify-around" aria-label="Bottom">
        @for (item of bottomNav; track item.path) {
          <a
            [routerLink]="item.path" routerLinkActive="text-blood-700 dark:text-blood-300"
            class="flex flex-col items-center flex-1 py-2 text-xs text-gray-500 dark:text-gray-400 no-underline"
          >
            <mat-icon>{{ item.icon }}</mat-icon>
            <span class="mt-0.5">{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
})
export class MainLayoutComponent {
  readonly auth  = inject(AuthStore);
  readonly notif = inject(NotificationsStore);

  readonly nav = [
    { path: '/dashboard',     icon: 'dashboard',       label: 'Dashboard' },
    { path: '/search',        icon: 'search',          label: 'Find Donors' },
    { path: '/request',       icon: 'bloodtype',       label: 'New Request' },
    { path: '/hospitals',     icon: 'local_hospital',  label: 'Hospitals' },
    { path: '/blood-banks',   icon: 'inventory_2',     label: 'Blood Banks' },
    { path: '/ai-chat',       icon: 'smart_toy',       label: 'AI Assistant' },
    { path: '/notifications', icon: 'notifications',   label: 'Notifications' },
    { path: '/history',       icon: 'history',         label: 'History' },
  ];

  readonly bottomNav = [
    { path: '/dashboard', icon: 'dashboard',  label: 'Home' },
    { path: '/search',    icon: 'search',     label: 'Search' },
    { path: '/request',   icon: 'add_circle', label: 'Request' },
    { path: '/ai-chat',   icon: 'smart_toy',  label: 'AI' },
    { path: '/profile',   icon: 'person',     label: 'Me' },
  ];
}
