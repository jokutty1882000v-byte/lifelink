import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { Hospital } from '../models/hospital.model';
import { GeoPoint } from '../models/geo.model';
import { distanceKm } from '../utils/distance.util';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private readonly api  = inject(ApiService);
  private readonly http = inject(HttpClient);

  list(): Observable<Hospital[]> {
    return environment.useMockApi
      ? this.http.get<Hospital[]>('assets/mock/hospitals.json')
      : this.api.get<Hospital[]>(API.hospitals.root);
  }

  nearby(origin: GeoPoint, radiusKm = 25): Observable<Hospital[]> {
    if (!environment.useMockApi) {
      return this.api.get<Hospital[]>(API.hospitals.nearby, { ...origin, radiusKm });
    }
    return this.list().pipe(
      map((hs) =>
        hs
          .map((h) => ({ ...h, distanceKm: distanceKm(origin, h.location) }))
          .filter((h) => (h.distanceKm ?? Infinity) <= radiusKm)
          .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)),
      ),
    );
  }

  getById(id: string): Observable<Hospital | undefined> {
    return environment.useMockApi
      ? this.list().pipe(map((all) => all.find((h) => h.id === id)))
      : this.api.get<Hospital>(API.hospitals.byId(id));
  }
}
