import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ALL_BLOOD_GROUPS, BloodGroup } from '@core/models/blood-group.enum';
import { BloodBank } from '@core/models/blood-bank.model';
import { BloodBankService } from '@core/services/blood-bank.service';
import { LocationService } from '@core/services/location.service';
import { BloodBankCardComponent } from '@shared/components/blood-bank-card/blood-bank-card.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'll-blood-banks-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatSelectModule,
    BloodBankCardComponent, LoadingSpinnerComponent, EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-6xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 class="text-2xl font-bold">Nearby Blood Banks</h1>
          <p class="text-sm text-gray-500">Filter by blood group availability.</p>
        </div>
        <mat-form-field appearance="outline" class="!w-48">
          <mat-label>Available for</mat-label>
          <mat-select [(ngModel)]="requiredGroup" (selectionChange)="onFilterChange()">
            <mat-option [value]="null">Any</mat-option>
            @for (g of groups; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <ll-loading-spinner label="Loading blood banks…" />
      } @else if (filtered().length === 0) {
        <ll-empty-state icon="inventory_2" title="No banks with stock"
          message="No nearby banks currently have this blood group in stock." />
      } @else {
        <div class="grid gap-3 md:grid-cols-2">
          @for (b of filtered(); track b.id) { <ll-blood-bank-card [bank]="b" /> }
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
  readonly groups  = ALL_BLOOD_GROUPS;

  requiredGroup: BloodGroup | null = null;
  private readonly filterSignal = signal<BloodGroup | null>(null);

  readonly filtered = computed(() => {
    const g = this.filterSignal();
    if (!g) return this.items();
    return this.items().filter((b) =>
      b.stock.some((s) => s.bloodGroup === g && s.unitsAvailable > 0),
    );
  });

  ngOnInit(): void {
    this.loc.getCurrentPosition().subscribe((p) =>
      this.svc.nearby({ lat: p.lat, lng: p.lng }, 50).subscribe((list) => {
        this.items.set(list);
        this.loading.set(false);
      }),
    );
  }

  onFilterChange(): void { this.filterSignal.set(this.requiredGroup); }
}
