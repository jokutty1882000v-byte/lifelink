import { GeoLocation } from './geo.model';

export interface Hospital {
  id: string;
  name: string;
  phone: string;
  email?: string;
  website?: string;
  location: GeoLocation;
  emergency24x7: boolean;
  hasBloodBank: boolean;
  specialties?: string[];
  ratingAvg?: number;
  distanceKm?: number;             // populated by search queries
}
