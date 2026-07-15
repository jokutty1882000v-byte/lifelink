import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Donor } from '@core/models/donor.model';
import { AvailabilityPrediction } from '@core/interfaces/ai-agent.interface';
import { DonorService } from '@core/services/donor.service';
import { AiService } from '@core/services/ai.service';
import { BloodGroupBadgeComponent } from '@shared/components/blood-group-badge/blood-group-badge.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { MapViewComponent } from '@shared/components/map-view/map-view.component';

@Component({
  selector: 'll-donor-detail-page',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    BloodGroupBadgeComponent, LoadingSpinnerComponent, MapViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      @if (donor(); as d) {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-6">
            <div class="flex items-center gap-4">
              <ll-blood-group-badge [value]="d.bloodGroup" size="lg" />
              <div class="flex-1">
                <h1 class="text-2xl font-bold">{{ d.fullName }}</h1>
                <p class="text-sm text-gray-500">
                  {{ d.totalDonations }} donations · {{ d.availability }}
                  @if (d.ratingAvg) { · ★ {{ d.ratingAvg | number:'1.1-1' }} }
                </p>
              </div>
              <a mat-flat-button color="warn" [href]="'tel:' + d.phone">
                <mat-icon>call</mat-icon> Call
              </a>
            </div>

            <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
              <div><dt class="text-gray-500">Phone</dt><dd>{{ d.phone }}</dd></div>
              <div><dt class="text-gray-500">Age</dt><dd>{{ d.age }}</dd></div>
              <div><dt class="text-gray-500">Weight</dt><dd>{{ d.weightKg }} kg</dd></div>
              <div><dt class="text-gray-500">Hemoglobin</dt><dd>{{ d.hemoglobin }} g/dL</dd></div>
              <div class="col-span-2 md:col-span-4">
                <dt class="text-gray-500">Location</dt>
                <dd>{{ d.location.address?.line1 }}, {{ d.location.address?.city }}</dd>
              </div>
            </dl>
          </mat-card-content>
        </mat-card>

        @if (prediction(); as p) {
          <mat-card class="!rounded-2xl">
            <mat-card-content class="!p-6">
              <div class="flex items-center gap-2 mb-2">
                <mat-icon class="text-blood-600">psychology</mat-icon>
                <h2 class="font-semibold">AI availability prediction</h2>
              </div>
              <p class="text-sm text-gray-500 mb-2">
                Likelihood of accepting within {{ p.windowMinutes }} minutes.
              </p>
              <mat-progress-bar mode="determinate" [value]="p.probability * 100" color="warn" />
              <div class="flex justify-between text-xs mt-1">
                <span>{{ (p.probability * 100) | number:'1.0-0' }}%</span>
                <span class="text-gray-500">{{ p.rationale }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-6">
            <h2 class="font-semibold mb-3">Location</h2>
            <ll-map-view [center]="d.location" [zoom]="14" [height]="280"
                         [markers]="[{ point: d.location, title: d.fullName }]" />
          </mat-card-content>
        </mat-card>
      } @else {
        <ll-loading-spinner label="Loading donor…" />
      }
    </div>
  `,
})
export class DonorDetailPage implements OnChanges {
  private readonly svc = inject(DonorService);
  private readonly ai  = inject(AiService);

  @Input() id?: string;
  readonly donor      = signal<Donor | undefined>(undefined);
  readonly prediction = signal<AvailabilityPrediction | null>(null);

  ngOnChanges(_c: SimpleChanges): void {
    if (!this.id) return;
    this.svc.getById(this.id).subscribe((d) => this.donor.set(d));
    this.ai.predictAvailability(this.id).subscribe((p) => this.prediction.set(p));
  }
}
