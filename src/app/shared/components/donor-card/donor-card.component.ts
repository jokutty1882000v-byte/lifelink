import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RankedDonor } from '@core/models/donor.model';
import { BloodGroupBadgeComponent } from '../blood-group-badge/blood-group-badge.component';
import { DistanceKmPipe } from '@shared/pipes/distance-km.pipe';
import { RankingExplainDialog } from '../ranking-explain/ranking-explain.dialog';

/** Compact card used in search results and dashboard "top donors" strip. */
@Component({
  selector: 'll-donor-card',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    BloodGroupBadgeComponent, DistanceKmPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="!rounded-2xl !shadow-sm hover:!shadow-md transition-shadow">
      <mat-card-content class="!p-4">
        <div class="flex items-start gap-3">
          <div class="shrink-0 relative">
            <ll-blood-group-badge [value]="ranked.donor.bloodGroup" size="lg" />
            @if (ranked.donor.availability === 'available') {
              <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" title="Available"></span>
            }
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold text-base truncate">{{ ranked.donor.fullName }}</h3>
              <span class="text-xs text-gray-500">{{ ranked.distanceKm | distanceKm }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ ranked.donor.totalDonations }} donations
              @if (ranked.donor.ratingAvg) { · ★ {{ ranked.donor.ratingAvg | number:'1.1-1' }} }
              @if (ranked.predictedResponseMinutes) { · ~{{ ranked.predictedResponseMinutes }}m to respond }
            </p>
            <div class="mt-2 flex flex-wrap gap-1">
              @for (r of ranked.reasons.slice(0, 3); track r) {
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-blood-50 text-blood-800 dark:bg-blood-900/40 dark:text-blood-100">
                  {{ r }}
                </span>
              }
            </div>
          </div>
          <div class="flex flex-col items-end shrink-0">
            <div class="text-[10px] uppercase tracking-wide text-gray-500">Score</div>
            <div class="text-lg font-bold text-blood-700">{{ (ranked.score * 100) | number:'1.0-0' }}</div>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end" class="!px-4 !pb-3">
        <button mat-button (click)="explain($event)" matTooltip="Why this ranking?">
          <mat-icon>psychology</mat-icon> Why?
        </button>
        <button mat-button (click)="view.emit(ranked)">
          <mat-icon>visibility</mat-icon> Details
        </button>
        <button mat-flat-button color="warn" (click)="contact.emit(ranked)">
          <mat-icon>call</mat-icon> Contact
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class DonorCardComponent {
  @Input({ required: true }) ranked!: RankedDonor;
  @Input() radiusKm = 25;
  @Output() readonly view    = new EventEmitter<RankedDonor>();
  @Output() readonly contact = new EventEmitter<RankedDonor>();

  private readonly dialog = inject(MatDialog);

  explain(evt: Event): void {
    evt.stopPropagation();
    this.dialog.open(RankingExplainDialog, {
      data: { ranked: this.ranked, radiusKm: this.radiusKm },
      panelClass: 'll-explain-dialog',
    });
  }
}
