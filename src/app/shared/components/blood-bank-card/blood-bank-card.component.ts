import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BloodBank, StockLevel } from '@core/models/blood-bank.model';
import { DistanceKmPipe } from '@shared/pipes/distance-km.pipe';

const LEVEL_COLOR: Record<StockLevel, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100',
  low:      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
  moderate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
  high:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
};

@Component({
  selector: 'll-blood-bank-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, DistanceKmPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="!rounded-2xl !shadow-sm">
      <mat-card-content class="!p-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold">{{ bank.name }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ bank.operatingHours }} · {{ bank.distanceKm | distanceKm }}
            </p>
          </div>
          <mat-icon class="text-blood-600">bloodtype</mat-icon>
        </div>
        <div class="mt-3 grid grid-cols-4 gap-2">
          @for (s of bank.stock; track s.bloodGroup) {
            <div class="text-center p-2 rounded-lg" [class]="levelClass(s.level)">
              <div class="text-xs font-medium">{{ s.bloodGroup }}</div>
              <div class="text-sm font-bold">{{ s.unitsAvailable }}</div>
            </div>
          }
        </div>
      </mat-card-content>
      <mat-card-actions align="end" class="!px-4 !pb-3">
        <a mat-button [href]="'tel:' + bank.phone"><mat-icon>call</mat-icon> Call</a>
      </mat-card-actions>
    </mat-card>
  `,
})
export class BloodBankCardComponent {
  @Input({ required: true }) bank!: BloodBank;
  levelClass(l: StockLevel): string { return LEVEL_COLOR[l]; }
}
