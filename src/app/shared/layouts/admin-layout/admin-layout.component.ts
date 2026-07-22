import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'll-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex bg-transparent">
      <aside class="w-56 bg-neutral-900/70 backdrop-blur-xl backdrop-saturate-150 border-r border-white/10 text-white flex flex-col p-3 gap-1">
        <div class="px-2 py-3 text-lg font-semibold flex items-center gap-2">
          <mat-icon>admin_panel_settings</mat-icon> Admin
        </div>
        @for (item of nav; track item.path) {
          <a
            [routerLink]="item.path" routerLinkActive="bg-white/10"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 no-underline text-white"
          >
            <mat-icon class="!text-xl">{{ item.icon }}</mat-icon>{{ item.label }}
          </a>
        }
      </aside>
      <main class="flex-1 overflow-y-auto"><router-outlet /></main>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly nav = [
    { path: 'overview', icon: 'insights',  label: 'Overview' },
    { path: 'users',    icon: 'group',     label: 'Users' },
    { path: 'requests', icon: 'bloodtype', label: 'Requests' },
  ];
}
