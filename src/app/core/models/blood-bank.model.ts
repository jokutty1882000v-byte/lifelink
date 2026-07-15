import { BloodGroup } from './blood-group.enum';
import { GeoLocation } from './geo.model';

export type StockLevel = 'critical' | 'low' | 'moderate' | 'high';

export interface BloodStock {
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  level: StockLevel;
  lastUpdated: string;
}

export interface BloodBank {
  id: string;
  name: string;
  phone: string;
  location: GeoLocation;
  operatingHours: string;
  stock: BloodStock[];
  distanceKm?: number;
  affiliatedHospitalId?: string;
}
