import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

export type AnalyticsEvent =
  | { name: 'auth.login';             props: { role: string } }
  | { name: 'auth.register';          props: { role: string } }
  | { name: 'search.performed';       props: { bloodGroup: string; radiusKm: number; results: number } }
  | { name: 'request.created';        props: { bloodGroup: string; urgency: string; units: number } }
  | { name: 'donor.contacted';        props: { donorId: string; channel: 'call' | 'sms' | 'whatsapp' } }
  | { name: 'ai.chat.sent';           props: { emergency: boolean } }
  | { name: 'notification.action';    props: { type: string } };

/**
 * Thin analytics abstraction. In dev we just log — in production, wire the
 * `emit` method to whatever provider you use (GA4 gtag, PostHog capture, Segment
 * track, Mixpanel track, etc.). Keeping the shape typed prevents typos across
 * the codebase.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  track<E extends AnalyticsEvent>(event: E): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.info('[analytics]', event.name, event.props);
      return;
    }
    this.emit(event);
  }

  private emit(_event: AnalyticsEvent): void {
    // Example provider hookups (uncomment one):
    //
    // GA4:
    //   (window as any).gtag?.('event', event.name, event.props);
    //
    // PostHog:
    //   (window as any).posthog?.capture(event.name, event.props);
    //
    // Segment:
    //   (window as any).analytics?.track(event.name, event.props);
  }
}
