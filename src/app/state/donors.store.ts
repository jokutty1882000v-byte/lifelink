import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { DonorAvailability, RankedDonor } from '@core/models/donor.model';
import { DonorSearchQuery } from '@core/interfaces/donor-search.interface';
import { DonorService } from '@core/services/donor.service';
import { RealtimeService } from '@core/services/realtime.service';

/** Signal-based store for the current search results and loading state. */
@Injectable({ providedIn: 'root' })
export class DonorsStore {
  private readonly svc      = inject(DonorService);
  private readonly realtime = inject(RealtimeService);

  private readonly _results     = signal<RankedDonor[]>([]);
  private readonly _loading     = signal(false);
  private readonly _query       = signal<DonorSearchQuery | null>(null);
  private readonly _error       = signal<string | null>(null);
  private readonly _lastLiveTick = signal<number>(0);

  readonly results      = this._results.asReadonly();
  readonly loading      = this._loading.asReadonly();
  readonly query        = this._query.asReadonly();
  readonly error        = this._error.asReadonly();
  readonly lastLiveTick = this._lastLiveTick.asReadonly();

  constructor() {
    // Merge live availability updates into whatever search results are shown.
    this.realtime.availabilityUpdates$.subscribe(({ donorId, availability }) => {
      this._results.update((list) =>
        list.map((r) => r.donor.id === donorId
          ? { ...r, donor: { ...r.donor, availability: availability as DonorAvailability } }
          : r,
        ),
      );
      this._lastLiveTick.set(Date.now());
    });
  }

  search(query: DonorSearchQuery): void {
    this._loading.set(true);
    this._query.set(query);
    this._error.set(null);
    this.svc
      .search(query)
      .pipe(tap({
        next:  (r)   => { this._results.set(r); this._loading.set(false); },
        error: (e)   => { this._error.set(String(e?.message ?? e)); this._loading.set(false); },
      }))
      .subscribe();
  }

  clear(): void {
    this._results.set([]);
    this._query.set(null);
    this._error.set(null);
  }
}
