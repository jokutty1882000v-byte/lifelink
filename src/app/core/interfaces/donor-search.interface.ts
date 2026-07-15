import { BloodGroup } from '../models/blood-group.enum';
import { GeoPoint } from '../models/geo.model';

export interface DonorSearchQuery {
  bloodGroup: BloodGroup;
  origin: GeoPoint;
  radiusKm?: number;              // default 25
  onlyEligible?: boolean;         // default true
  onlyAvailable?: boolean;        // default true
  minRating?: number;
  limit?: number;
}
