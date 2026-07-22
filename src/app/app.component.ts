import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RealtimeService } from '@core/services/realtime.service';

@Component({
  selector: 'll-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Injecting boots the realtime layer: opens the notification WS after login,
  // closes on logout, and (in mock mode) emits synthetic events every 30s.
  private readonly realtime = inject(RealtimeService);
}
