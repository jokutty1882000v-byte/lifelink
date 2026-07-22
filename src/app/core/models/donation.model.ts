import { BloodGroup } from './blood-group.enum';

export type DonationStatus = 'scheduled' | 'completed' | 'cancelled' | 'deferred';

export interface Donation {
  id: string;
  donorId: string;
  requestId?: string;
  bloodGroup: BloodGroup;
  units: number;
  status: DonationStatus;
  bloodBankId?: string;
  bloodBankName?: string;
  hospitalName?: string;
  donatedAt: string;      // ISO
  certificateUrl?: string;
  notes?: string;
}
