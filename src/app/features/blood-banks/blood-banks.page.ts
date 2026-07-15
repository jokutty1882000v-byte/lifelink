import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { BloodBank } from '@core/models/blood-bank.model';
import { BloodBankService } from '@core/services/blood-bank.service';
import { LocationService } from '@core/services/location.service';
import { BloodBankCardComponent } from '@shared/components/blood-bank-card/blood-bank-card.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'll-blood-banks-page',
  standalone: true,
  imports: [CommonModule, BloodBankCardComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold">Nearby Blood Banks</h1>
      <p class="text-sm text-gray-500">Live stock levels by blood group.</p>
      @if (loading()) {
        <ll-loading-spinner label="Loading blood banks…" />
      } @else {
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          @for (b of items(); track b.id) { <ll-blood-bank-card [bank]="b" /> }
        </div>
      }
    </div>
  `,
})
export class BloodBanksPage implements OnInit {
  private readonly svc = inject(BloodBankService);
  private readonly loc = inject(LocationService);
  readonly items   = signal<BloodBank[]>([]);
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
