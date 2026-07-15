import { BloodGroup } from './blood-group.enum';
import { GeoLocation } from './geo.model';

export type DonorAvailability = 'available' | 'unavailable' | 'recovering';

export interface Donor {
  id: string;
  userId: string;
  fullName: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  location: GeoLocation;
  availability: DonorAvailability;
  lastDonationDate?: string;      // ISO
  totalDonations: number;
  isEligible: boolean;             // computed by backend (56-day rule, health)
  chronicConditions?: string[];
  weightKg?: number;
  hemoglobin?: number;
  ratingAvg?: number;              // 0..5
  responseRateAvg?: number;        // 0..1
  avatarUrl?: string;
}

/** Result of AI/rules-based ranking — surfaced to the UI for transparency. */
export interface RankedDonor {
  donor: Donor;
  score: number;                   // 0..1
  distanceKm: number;
  reasons: string[];               // human-readable explanation
  predictedResponseMinutes?: number;
}
