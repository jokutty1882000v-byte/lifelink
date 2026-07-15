import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';

@Component({
  selector: 'll-login-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    FormErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="text-2xl font-bold">Welcome back</h2>
    <p class="text-sm text-gray-500 mt-1">Sign in to continue.</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 flex flex-col gap-1">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email" />
        <mat-icon matSuffix>mail</mat-icon>
      </mat-form-field>
      <ll-form-error [control]="form.controls.email" />

      <mat-form-field appearance="outline" class="mt-2">
        <mat-label>Password</mat-label>
        <input matInput [type]="showPwd() ? 'text' : 'password'"
               formControlName="password" autocomplete="current-password" />
        <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())"
                [attr.aria-label]="showPwd() ? 'Hide password' : 'Show password'">
          <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>
      <ll-form-error [control]="form.controls.password" />

      <button mat-flat-button color="warn" type="submit"
              class="!mt-4 !h-12" [disabled]="form.invalid || loading()">
        @if (loading()) {
          <mat-spinner diameter="20" mode="indeterminate" />
        } @else { Sign in }
      </button>

      <p class="text-sm text-center mt-4">
        New here? <a routerLink="/auth/register" class="text-blood-700 font-medium">Create account</a>
      </p>
    </form>
  `,
})
export class LoginPage {
  private readonly fb     = inject(FormBuilder).nonNullable;
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly snack  = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly showPwd = signal(false);

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Sign-in failed. Check your credentials.', 'Dismiss', { duration: 4000 });
      },
    });
  }
}
