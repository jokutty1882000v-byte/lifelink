import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'll-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen grid md:grid-cols-2 bg-transparent">
      <!-- Brand / hero — red glass over the aurora backdrop -->
      <div class="hidden md:flex flex-col justify-between p-10 text-white
                  bg-gradient-to-br from-blood-700/85 to-blood-900/85
                  backdrop-blur-2xl backdrop-saturate-150 border-r border-white/20">
        <div class="flex items-center gap-2 text-lg font-semibold">
          <mat-icon>bloodtype</mat-icon> LifeLink
        </div>
        <div>
          <h1 class="text-4xl font-bold leading-tight">Every drop counts.</h1>
          <p class="mt-3 text-blood-100 max-w-md">
            AI-assisted matching connects patients with the closest, most eligible donors —
            faster, safer, transparent.
          </p>
        </div>
        <p class="text-xs text-blood-200">© 2026 LifeLink</p>
      </div>

      <!-- Form panel — frosted glass card -->
      <div class="flex items-center justify-center p-6 md:p-10">
        <div class="w-full max-w-md ll-glass rounded-3xl p-8">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
