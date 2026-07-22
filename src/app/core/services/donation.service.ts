import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { Donation } from '../models/donation.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly api  = inject(ApiService);
  private readonly http = inject(HttpClient);

  list(): Observable<Donation[]> {
    const src = environment.useMockApi
      ? this.http.get<Donation[]>('assets/mock/donations.json')
      : this.api.get<Donation[]>('/donations');
    return src.pipe(
      map((list) => [...list].sort((a, b) => b.donatedAt.localeCompare(a.donatedAt))),
    );
  }
}
