import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RankedDonor } from '@core/models/donor.model';
import { DEFAULT_RANKING_WEIGHTS } from '@core/utils/donor-ranking.util';
import { BloodGroupBadgeComponent } from '../blood-group-badge/blood-group-badge.component';

interface Factor {
  key: keyof typeof DEFAULT_RANKING_WEIGHTS;
  label: string;
  weight: number;      // 0..1
  value: number;       // 0..1
  contribution: number;
  detail: string;
}

/**
 * Explains how the donor got their ranking score. Uses the same weights as the
 * scoring function so the numbers reconcile exactly. Every value is derived from
 * the donor data — no server round-trip.
 */
@Component({
  selector: 'll-ranking-explain-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    BloodGroupBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-w-[320px] max-w-[420px]">
      <div mat-dialog-title class="flex items-center gap-3 !mb-0">
        <ll-blood-group-badge [value]="ranked.donor.bloodGroup" size="md" />
        <div>
          <div class="font-semibold">{{ ranked.donor.fullName }}</div>
          <div class="text-xs text-gray-500">Score {{ (ranked.score * 100) | number:'1.0-0' }}/100</div>
        </div>
      </div>

      <mat-dialog-content class="!pt-4">
        <p class="text-xs text-gray-500 mb-3">
          Weighted breakdown — each factor is scored 0–100 then multiplied by its weight.
        </p>

        <ul class="space-y-3">
          @for (f of factors(); track f.key) {
            <li>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{{ f.label }}</span>
                <span class="text-xs text-gray-500">
                  weight {{ f.weight * 100 | number:'1.0-0' }}% ·
                  contribution {{ f.contribution * 100 | number:'1.1-1' }}
                </span>
              </div>
              <mat-progress-bar mode="determinate" [value]="f.value * 100" color="warn" />
              <div class="text-xs text-gray-500 mt-0.5">{{ f.detail }}</div>
            </li>
          }
        </ul>

        <div class="mt-4 p-3 rounded-lg bg-blood-50 dark:bg-blood-900/30 text-sm">
          <div class="flex items-center gap-2 font-medium">
            <mat-icon class="text-blood-700 !text-lg">psychology</mat-icon> Agent summary
          </div>
          <ul class="mt-1 list-disc list-inside text-xs text-gray-700 dark:text-gray-200">
            @for (r of ranked.reasons; track r) { <li>{{ r }}</li> }
          </ul>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </div>
  `,
})
export class RankingExplainDialog {
  readonly ranked: RankedDonor;
  readonly factors = computed<Factor[]>(() => this.build());

  constructor(
    public readonly ref: MatDialogRef<RankingExplainDialog>,
    @Inject(MAT_DIALOG_DATA) data: { ranked: RankedDonor; radiusKm?: number },
  ) {
    this.ranked = data.ranked;
    this._radiusKm = data.radiusKm ?? 25;
  }

  private readonly _radiusKm: number;

  private build(): Factor[] {
    const d = this.ranked.donor;
    const proximity = 1 - Math.min(1, this.ranked.distanceKm / this._radiusKm);
    const rating    = (d.ratingAvg ?? 3) / 5;
    const response  = d.responseRateAvg ?? 0.5;
    const eligible  = d.isEligible ? 1 : 0;
    const available = d.availability === 'available' ? 1 : 0;

    const w = DEFAULT_RANKING_WEIGHTS;
    return [
      { key: 'distance',  label: 'Proximity',        weight: w.distance,  value: proximity, contribution: w.distance  * proximity,
        detail: `${this.ranked.distanceKm.toFixed(1)} km of ${this._radiusKm} km radius` },
      { key: 'eligible',  label: 'Eligibility',      weight: w.eligible,  value: eligible,  contribution: w.eligible  * eligible,
        detail: d.isEligible ? 'Meets 56-day rule' : 'Not eligible yet' },
      { key: 'available', label: 'Availability',     weight: w.available, value: available, contribution: w.available * available,
        detail: `Marked ${d.availability}` },
      { key: 'rating',    label: 'Donor rating',     weight: w.rating,    value: rating,    contribution: w.rating    * rating,
        detail: `★ ${(d.ratingAvg ?? 3).toFixed(1)} average` },
      { key: 'response',  label: 'Response rate',    weight: w.response,  value: response,  contribution: w.response  * response,
        detail: `${((d.responseRateAvg ?? 0.5) * 100).toFixed(0)}% historical response` },
    ];
  }
}
