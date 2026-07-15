import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { ALL_BLOOD_GROUPS } from '@core/models/blood-group.enum';
import { phoneValidator, strongPasswordValidator, donorAgeValidator, bloodGroupValidator } from '@core/utils/validators.util';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';

@Component({
  selector: 'll-register-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
    FormErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="text-2xl font-bold">Create account</h2>
    <p class="text-sm text-gray-500 mt-1">Join the LifeLink community.</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 grid grid-cols-1 gap-1">
      <mat-form-field appearance="outline">
        <mat-label>Full name</mat-label>
        <input matInput formControlName="fullName" autocomplete="name" />
      </mat-form-field>
      <ll-form-error [control]="form.controls.fullName" />

      <mat-form-field appearance="outline" class="mt-2">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email" />
      </mat-form-field>
      <ll-form-error [control]="form.controls.email" />

      <mat-form-field appearance="outline" class="mt-2">
        <mat-label>Phone</mat-label>
        <input matInput type="tel" formControlName="phone" autocomplete="tel" placeholder="+91…" />
      </mat-form-field>
      <ll-form-error [control]="form.controls.phone" />

      <div class="grid grid-cols-2 gap-3 mt-2">
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Date of birth</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dateOfBirth" />
            <mat-datepicker-toggle matIconSuffix [for]="dp" />
            <mat-datepicker #dp />
          </mat-form-field>
          <ll-form-error [control]="form.controls.dateOfBirth" />
        </div>
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Blood group</mat-label>
            <mat-select formControlName="bloodGroup">
              @for (g of groups; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <ll-form-error [control]="form.controls.bloodGroup" />
        </div>
      </div>

      <mat-form-field appearance="outline" class="mt-2">
        <mat-label>I want to</mat-label>
        <mat-select formControlName="role">
          <mat-option value="donor">Donate blood</mat-option>
          <mat-option value="requester">Request blood</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="mt-2">
        <mat-label>Password</mat-label>
        <input matInput [type]="showPwd() ? 'text' : 'password'"
               formControlName="password" autocomplete="new-password" />
        <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
          <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>
      <ll-form-error [control]="form.controls.password" />

      <button mat-flat-button color="warn" type="submit"
              class="!mt-4 !h-12" [disabled]="form.invalid || loading()">
        @if (loading()) { <mat-spinner diameter="20" /> } @else { Create account }
      </button>

      <p class="text-sm text-center mt-4">
        Already registered? <a routerLink="/auth/login" class="text-blood-700 font-medium">Sign in</a>
      </p>
    </form>
  `,
})
export class RegisterPage {
  private readonly fb     = inject(FormBuilder).nonNullable;
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack  = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly showPwd = signal(false);
  readonly groups  = ALL_BLOOD_GROUPS;

  readonly form = this.fb.group({
    fullName:    ['', [Validators.required, Validators.minLength(2)]],
    email:       ['', [Validators.required, Validators.email]],
    phone:       ['', [Validators.required, phoneValidator]],
    dateOfBirth: ['', [Validators.required, donorAgeValidator(18, 65)]],
    bloodGroup:  ['', [Validators.required, bloodGroupValidator]],
    role:        ['donor' as 'donor' | 'requester', [Validators.required]],
    password:    ['', [Validators.required, strongPasswordValidator]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.form.getRawValue();
    this.auth.register({
      fullName: v.fullName, email: v.email, phone: v.phone, password: v.password,
      role: v.role, bloodGroup: v.bloodGroup,
      dateOfBirth: typeof v.dateOfBirth === 'string' ? v.dateOfBirth : new Date(v.dateOfBirth).toISOString(),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Welcome to LifeLink!', 'Dismiss', { duration: 3000 });
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Registration failed. Please try again.', 'Dismiss', { duration: 4000 });
      },
    });
  }
}
