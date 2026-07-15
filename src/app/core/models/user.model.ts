import { BloodGroup } from './blood-group.enum';
import { GeoLocation } from './geo.model';

export type UserRole = 'donor' | 'requester' | 'admin' | 'hospital_staff';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  bloodGroup?: BloodGroup;
  dateOfBirth?: string;   // ISO date
  gender?: 'male' | 'female' | 'other';
  location?: GeoLocation;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
