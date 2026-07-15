import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { BloodBank } from '../models/blood-bank.model';
import { GeoPoint } from '../models/geo.model';
import { distanceKm } from '../utils/distance.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BloodBankService {
  private readonly api  = inject(ApiService);
  private readonly http = inject(HttpClient);

  list(): Observable<BloodBank[]> {
    return environment.useMockApi
      ? this.http.get<BloodBank[]>('assets/mock/blood-banks.json')
      : this.api.get<BloodBank[]>(API.bloodBanks.root);
  }

  nearby(origin: GeoPoint, radiusKm = 25): Observable<BloodBank[]> {
    if (!environment.useMockApi) {
      return this.api.get<BloodBank[]>(API.bloodBanks.nearby, { ...origin, radiusKm });
    }
    return this.list().pipe(
      map((banks) =>
        banks
          .map((b) => ({ ...b, distanceKm: distanceKm(origin, b.location) }))
          .filter((b) => (b.distanceKm ?? Infinity) <= radiusKm)
          .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)),
      ),
    );
  }

  getById(id: string): Observable<BloodBank | undefined> {
    return environment.useMockApi
      ? this.list().pipe(map((all) => all.find((b) => b.id === id)))
      : this.api.get<BloodBank>(API.bloodBanks.byId(id));
  }
}
