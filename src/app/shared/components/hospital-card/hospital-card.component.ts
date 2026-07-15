import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Hospital } from '@core/models/hospital.model';
import { DistanceKmPipe } from '@shared/pipes/distance-km.pipe';

@Component({
  selector: 'll-hospital-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, DistanceKmPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="!rounded-2xl !shadow-sm">
      <mat-card-content class="!p-4">
        <div class="flex items-start gap-3">
          <mat-icon class="text-blood-600 !text-3xl !w-8 !h-8">local_hospital</mat-icon>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold truncate">{{ hospital.name }}</h3>
              <span class="text-xs text-gray-500">{{ hospital.distanceKm | distanceKm }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5 truncate">
              {{ hospital.location.address?.line1 }}, {{ hospital.location.address?.city }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1">
              @if (hospital.emergency24x7) {
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">24×7 Emergency</span>
              }
              @if (hospital.hasBloodBank) {
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Blood Bank</span>
              }
            </div>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end" class="!px-4 !pb-3">
        <a mat-button [href]="'tel:' + hospital.phone">
          <mat-icon>call</mat-icon> Call
        </a>
      </mat-card-actions>
    </mat-card>
  `,
})
export class HospitalCardComponent {
  @Input({ required: true }) hospital!: Hospital;
}
