import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Serializes token-refresh calls. If ten requests fail with 401 concurrently,
 * we still only call `/auth/refresh` once; the other nine wait on the same
 * ReplaySubject and then retry with the new token.
 */
@Injectable({ providedIn: 'root' })
export class RefreshCoordinator {
  private readonly auth = inject(AuthService);
  private current$: Observable<string> | null = null;

  refresh(): Observable<string> {
    if (this.current$) return this.current$;

    const subject = new ReplaySubject<string>(1);
    this.current$ = subject.asObservable();

    this.auth.refresh().subscribe({
      next:  (tokens) => subject.next(tokens.accessToken),
      error: (err)    => { this.auth.logout(); subject.error(err); this.current$ = null; },
      complete:       () => { subject.complete(); this.current$ = null; },
    });

    return this.current$.pipe(catchError((err) => throwError(() => err)));
  }
}
