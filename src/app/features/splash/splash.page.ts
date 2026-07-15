import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '@state/auth.store';

@Component({
  selector: 'll-splash-page',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blood-700 to-blood-900 text-white">
      <mat-icon class="!text-8xl !w-24 !h-24 animate-pulse">bloodtype</mat-icon>
      <h1 class="mt-4 text-4xl font-bold tracking-tight">LifeLink</h1>
      <p class="mt-2 text-blood-100">Every drop counts.</p>
    </div>
  `,
})
export class SplashPage implements OnInit {
  private readonly router = inject(Router);
  private readonly auth   = inject(AuthStore);

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigateByUrl(this.auth.isAuthenticated() ? '/dashboard' : '/auth/login');
    }, 1200);
  }
}
