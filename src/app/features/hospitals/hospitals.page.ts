import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Hospital } from '@core/models/hospital.model';
import { HospitalService } from '@core/services/hospital.service';
import { LocationService } from '@core/services/location.service';
import { HospitalCardComponent } from '@shared/components/hospital-card/hospital-card.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'll-hospitals-page',
  standalone: true,
  imports: [CommonModule, HospitalCardComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold">Nearby Hospitals</h1>
      <p class="text-sm text-gray-500">Sorted by distance from your current location.</p>
      @if (loading()) {
        <ll-loading-spinner label="Finding hospitals…" />
      } @else {
        <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          @for (h of items(); track h.id) { <ll-hospital-card [hospital]="h" /> }
        </div>
      }
    </div>
  `,
})
export class HospitalsPage implements OnInit {
  private readonly svc = inject(HospitalService);
  private readonly loc = inject(LocationService);
  readonly items = signal<Hospital[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loc.getCurrentPosition().subscribe((p) =>
      this.svc.nearby({ lat: p.lat, lng: p.lng }, 50).subscribe((list) => {
        this.items.set(list);
        this.loading.set(false);
      }),
    );
  }
}
