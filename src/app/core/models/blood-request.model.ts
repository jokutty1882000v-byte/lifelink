import { BloodGroup } from './blood-group.enum';
import { GeoLocation } from './geo.model';

export type RequestUrgency = 'routine' | 'urgent' | 'emergency';
export type RequestStatus  = 'open' | 'matched' | 'fulfilled' | 'cancelled' | 'expired';

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  patientName?: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: RequestUrgency;
  status: RequestStatus;
  hospitalId?: string;
  hospitalName?: string;
  location: GeoLocation;
  neededByIso: string;
  notes?: string;
  matchedDonorIds: string[];
  createdAt: string;
  updatedAt: string;
}
