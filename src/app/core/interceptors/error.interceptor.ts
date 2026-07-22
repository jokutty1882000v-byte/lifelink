import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../interfaces/api-result.interface';

/**
 * Runs AFTER the auth interceptor. By the time we see a 401 here, refresh has
 * already been attempted and failed — that's when we clear the session and bounce.
 * Everything else surfaces as a toast; features can still catch it locally.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        auth.logout();
        router.navigate(['/auth/login']);
      } else if (err.status !== 0) {
        snack.open(extractMessage(err), 'Dismiss', { duration: 5000, panelClass: 'll-snack-error' });
      }
      return throwError(() => err);
    }),
  );
};

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error as ApiError | undefined;
  if (body?.detail) {
    if (typeof body.detail === 'string') return body.detail;
    return body.detail.map((d) => d.msg).join(', ');
  }
  return err.message || 'Something went wrong.';
}
