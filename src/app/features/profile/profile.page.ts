import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '@state/auth.store';

@Component({
  selector: 'll-profile-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold">Profile</h1>
      <mat-card class="!rounded-2xl mt-4">
        <mat-card-content class="!p-6 flex items-center gap-4">
          <mat-icon class="!text-6xl text-gray-400">account_circle</mat-icon>
          <div>
            <div class="text-lg font-medium">{{ auth.displayName() }}</div>
            <div class="text-sm text-gray-500">{{ auth.user()?.email ?? 'Not signed in' }}</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ProfilePage {
  readonly auth = inject(AuthStore);
}
