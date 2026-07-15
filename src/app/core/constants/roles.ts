import { UserRole } from '../models/user.model';

export const ROLES: Record<UserRole, UserRole> = {
  donor:          'donor',
  requester:      'requester',
  admin:          'admin',
  hospital_staff: 'hospital_staff',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  donor:          'Donor',
  requester:      'Requester',
  admin:          'Administrator',
  hospital_staff: 'Hospital Staff',
};
