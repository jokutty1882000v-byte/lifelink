import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { Donor, RankedDonor } from '../models/donor.model';
import { DonorSearchQuery } from '../interfaces/donor-search.interface';
import { rankDonors } from '../utils/donor-ranking.util';
import { ApiService } from './api.service';

/**
 * Donor read/search API. When `useMockApi` is on, we hit the local JSON fixture
 * and run the ranking client-side so the UI is fully usable without a backend.
 */
@Injectable({ providedIn: 'root' })
export class DonorService {
  private readonly api  = inject(ApiService);
  private readonly http = inject(HttpClient);

  list(): Observable<Donor[]> {
    return environment.useMockApi
      ? this.http.get<Donor[]>('assets/mock/donors.json')
      : this.api.get<Donor[]>(API.donors.root);
  }

  getById(id: string): Observable<Donor | undefined> {
    return environment.useMockApi
      ? this.list().pipe(map((all) => all.find((d) => d.id === id)))
      : this.api.get<Donor>(API.donors.byId(id));
  }

  search(query: DonorSearchQuery): Observable<RankedDonor[]> {
    if (!environment.useMockApi) {
      return this.api.post<RankedDonor[], DonorSearchQuery>(API.donors.search, query);
    }
    return this.list().pipe(
      map((donors) => {
        const filtered = donors.filter((d) => {
          if (query.onlyEligible  && !d.isEligible) return false;
          if (query.onlyAvailable && d.availability !== 'available') return false;
          if (query.minRating && (d.ratingAvg ?? 0) < query.minRating) return false;
          return true;
        });
        const ranked = rankDonors(filtered, query.bloodGroup, query.origin, query.radiusKm ?? 25);
        return query.limit ? ranked.slice(0, query.limit) : ranked;
      }),
    );
  }

  requestContact(donorId: string, requestId: string): Observable<{ ok: boolean }> {
    if (environment.useMockApi) return of({ ok: true });
    return this.api.post<{ ok: boolean }, { requestId: string }>(
      API.donors.contact(donorId),
      { requestId },
    );
  }
}
