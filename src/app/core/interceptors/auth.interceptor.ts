import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RefreshCoordinator } from '../services/refresh-coordinator.service';

/**
 * Attaches Bearer token and transparently refreshes on 401 exactly once per request.
 * Concurrent 401s share a single refresh in flight (see RefreshCoordinator) so we
 * don't hammer the backend with N parallel refresh calls.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const coordinator = inject(RefreshCoordinator);

  const withToken = (r: HttpRequest<unknown>, token?: string) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  const initial = withToken(req, auth.tokens()?.accessToken);
  return next(initial).pipe(
    catchError((err: HttpErrorResponse) => {
      const canRetry = err.status === 401
        && !!auth.tokens()?.refreshToken
        && !req.url.includes('/auth/refresh');
      if (!canRetry) return throwError(() => err);
      return coordinator.refresh().pipe(
        switchMap((newToken) => next(withToken(req, newToken))),
      );
    }),
  );
};
