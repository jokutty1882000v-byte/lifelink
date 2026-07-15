import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'distanceKm', standalone: true, pure: true })
export class DistanceKmPipe implements PipeTransform {
  transform(km: number | null | undefined, digits = 1): string {
    if (km == null || Number.isNaN(km)) return '—';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(digits)} km`;
  }
}
