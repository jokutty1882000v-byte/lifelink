import { Injectable, signal } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GeoLocation } from '../models/geo.model';
import { environment } from '@env/environment';

/**
 * Wraps the browser Geolocation API and caches the last-known fix as a signal
 * for components that need current lat/lng (search, hospitals, request).
 */
@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly _current = signal<GeoLocation | null>(null);
  readonly current = this._current.asReadonly();

  getCurrentPosition(highAccuracy = false): Observable<GeoLocation> {
    return from(
      new Promise<GeoLocation>((resolve, reject) => {
        if (!('geolocation' in navigator)) return reject(new Error('Geolocation unavailable'));
        navigator.geolocation.getCurrentPosition(
          (p) => {
            const loc: GeoLocation = {
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              accuracyMeters: p.coords.accuracy,
              timestamp: new Date(p.timestamp).toISOString(),
            };
            this._current.set(loc);
            resolve(loc);
          },
          (err) => reject(err),
          { enableHighAccuracy: highAccuracy, timeout: 10_000, maximumAge: 30_000 },
        );
      }),
    ).pipe(
      catchError(() => {
        const [lat, lng] = environment.map.defaultCenter;
        const fallback: GeoLocation = { lat, lng, timestamp: new Date().toISOString() };
        this._current.set(fallback);
        return of(fallback);
      }),
    );
  }
}
