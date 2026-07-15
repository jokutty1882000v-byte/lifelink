import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../interfaces/api-result.interface';

/**
 * Global error handler:
 * - 401 → wipe session and bounce to /auth/login
 * - other → surface a toast; propagate so features can still handle if they want
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/auth/login']);
      } else {
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
