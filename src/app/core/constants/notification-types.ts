import { NotificationType, NotificationSeverity } from '../models/notification.model';

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  donor_match:          'volunteer_activism',
  blood_request:        'bloodtype',
  emergency_alert:      'emergency',
  eligibility_reminder: 'schedule',
  donation_confirmed:   'check_circle',
  system:               'info',
};

export const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  info:     'text-blue-600',
  success:  'text-green-600',
  warning:  'text-amber-600',
  critical: 'text-red-700',
};
