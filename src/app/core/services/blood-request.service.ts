import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '@env/environment';
import { API } from '../constants/api-endpoints';
import { BloodRequest } from '../models/blood-request.model';
import { ApiService } from './api.service';

export type CreateBloodRequest = Omit<
  BloodRequest,
  'id' | 'status' | 'matchedDonorIds' | 'createdAt' | 'updatedAt'
>;

@Injectable({ providedIn: 'root' })
export class BloodRequestService {
  private readonly api = inject(ApiService);

  private readonly mockStore: BloodRequest[] = [];

  list(): Observable<BloodRequest[]> {
    return environment.useMockApi
      ? of([...this.mockStore])
      : this.api.get<BloodRequest[]>(API.requests.root);
  }

  mine(): Observable<BloodRequest[]> {
    return environment.useMockApi
      ? of([...this.mockStore])
      : this.api.get<BloodRequest[]>(API.requests.mine);
  }

  create(input: CreateBloodRequest): Observable<BloodRequest> {
    if (!environment.useMockApi) {
      return this.api.post<BloodRequest, CreateBloodRequest>(API.requests.root, input);
    }
    const now = new Date().toISOString();
    const created: BloodRequest = {
      ...input,
      id: `req-${Date.now()}`,
      status: 'open',
      matchedDonorIds: [],
      createdAt: now,
      updatedAt: now,
    };
    this.mockStore.unshift(created);
    return of(created);
  }

  fulfill(id: string): Observable<BloodRequest> {
    if (!environment.useMockApi) return this.api.post<BloodRequest>(API.requests.fulfill(id));
    const req = this.mockStore.find((r) => r.id === id);
    if (req) { req.status = 'fulfilled'; req.updatedAt = new Date().toISOString(); }
    return of(req!);
  }

  cancel(id: string): Observable<void> {
    if (!environment.useMockApi) return this.api.delete<void>(API.requests.byId(id));
    const idx = this.mockStore.findIndex((r) => r.id === id);
    if (idx >= 0) this.mockStore.splice(idx, 1);
    return of(void 0);
  }
}
