export type NotificationType =
  | 'donor_match'
  | 'blood_request'
  | 'emergency_alert'
  | 'eligibility_reminder'
  | 'donation_confirmed'
  | 'system';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
