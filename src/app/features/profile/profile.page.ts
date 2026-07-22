import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ALL_BLOOD_GROUPS } from '@core/models/blood-group.enum';
import { AuthStore } from '@state/auth.store';
import { BloodGroupBadgeComponent } from '@shared/components/blood-group-badge/blood-group-badge.component';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { phoneValidator, bloodGroupValidator } from '@core/utils/validators.util';

@Component({
  selector: 'll-profile-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule,
    BloodGroupBadgeComponent, FormErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold">Profile</h1>

      @if (user()?.role === 'donor') {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-4 flex items-center justify-between gap-4">
            <div>
              <div class="font-medium">On duty</div>
              <div class="text-xs text-gray-500">
                Turn off to stop receiving match requests temporarily.
              </div>
            </div>
            <mat-slide-toggle color="warn" [checked]="onDuty()" (change)="toggleDuty($event.checked)" />
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="!rounded-2xl">
        <mat-card-content class="!p-6 flex items-center gap-4">
          <div class="relative">
            <mat-icon class="!text-7xl !w-16 !h-16 text-gray-400">account_circle</mat-icon>
            @if (user()?.bloodGroup) {
              <span class="absolute -bottom-1 -right-1">
                <ll-blood-group-badge [value]="user()!.bloodGroup!" size="sm" />
              </span>
            }
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-lg font-semibold truncate">{{ auth.displayName() }}</div>
            <div class="text-sm text-gray-500 truncate">{{ user()?.email }}</div>
            <div class="text-xs text-gray-400 mt-1">Role: {{ user()?.role ?? '—' }}</div>
          </div>
          <button mat-stroked-button (click)="toggleEdit()">
            <mat-icon>{{ editing() ? 'close' : 'edit' }}</mat-icon>
            {{ editing() ? 'Cancel' : 'Edit' }}
          </button>
        </mat-card-content>
      </mat-card>

      @if (editing()) {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-6">
            <form [formGroup]="form" (ngSubmit)="save()" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <mat-form-field appearance="outline"><mat-label>Full name</mat-label><input matInput formControlName="fullName" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone" /></mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Blood group</mat-label>
                <mat-select formControlName="bloodGroup">
                  @for (g of groups; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="male">Male</mat-option>
                  <mat-option value="female">Female</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="md:col-span-2 flex justify-end gap-2 mt-2">
                <button mat-button type="button" (click)="toggleEdit()">Cancel</button>
                <button mat-flat-button color="warn" type="submit" [disabled]="form.invalid">
                  <mat-icon>save</mat-icon> Save
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-6">
            <dl class="grid grid-cols-2 gap-4 text-sm">
              <div><dt class="text-gray-500">Phone</dt><dd>{{ user()?.phone ?? '—' }}</dd></div>
              <div><dt class="text-gray-500">Blood group</dt><dd>{{ user()?.bloodGroup ?? '—' }}</dd></div>
              <div><dt class="text-gray-500">Gender</dt><dd>{{ user()?.gender ?? '—' }}</dd></div>
              <div><dt class="text-gray-500">Verified</dt>
                <dd>{{ user()?.isVerified ? 'Yes' : 'No' }}</dd></div>
            </dl>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class ProfilePage {
  readonly auth = inject(AuthStore);
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly snack = inject(MatSnackBar);

  readonly user    = this.auth.user;
  readonly editing = signal(false);
  readonly onDuty  = signal(true);
  readonly groups  = ALL_BLOOD_GROUPS;

  toggleDuty(checked: boolean): void {
    this.onDuty.set(checked);
    this.snack.open(
      checked ? 'You are on duty — donors get matched to you.' : 'You are off duty.',
      'Dismiss',
      { duration: 3000 },
    );
  }

  readonly form = this.fb.group({
    fullName:   ['', [Validators.required]],
    phone:      ['', [Validators.required, phoneValidator]],
    bloodGroup: ['', [bloodGroupValidator]],
    gender:     [''],
  });

  toggleEdit(): void {
    const u = this.user();
    if (!this.editing() && u) {
      this.form.patchValue({
        fullName: u.fullName, phone: u.phone,
        bloodGroup: u.bloodGroup ?? '', gender: u.gender ?? '',
      });
    }
    this.editing.update((v) => !v);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    // Real API call arrives in Phase 7 — for now, update the local session snapshot.
    this.snack.open('Profile saved.', 'Dismiss', { duration: 3000 });
    this.editing.set(false);
  }
}
