import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RankedDonor } from '@core/models/donor.model';
import { BloodGroupBadgeComponent } from '../blood-group-badge/blood-group-badge.component';
import { DistanceKmPipe } from '@shared/pipes/distance-km.pipe';

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
          <div class="shrink-0">
            <ll-blood-group-badge [value]="ranked.donor.bloodGroup" size="lg" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold text-base truncate">{{ ranked.donor.fullName }}</h3>
              <span class="text-xs text-gray-500">{{ ranked.distanceKm | distanceKm }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ ranked.donor.totalDonations }} donations
              @if (ranked.donor.ratingAvg) { · ★ {{ ranked.donor.ratingAvg | number:'1.1-1' }} }
            </p>
            <div class="mt-2 flex flex-wrap gap-1">
              @for (r of ranked.reasons.slice(0, 3); track r) {
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-blood-50 text-blood-800 dark:bg-blood-900/40 dark:text-blood-100">
                  {{ r }}
                </span>
              }
            </div>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end" class="!px-4 !pb-3">
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
  @Output() readonly view    = new EventEmitter<RankedDonor>();
  @Output() readonly contact = new EventEmitter<RankedDonor>();
}
