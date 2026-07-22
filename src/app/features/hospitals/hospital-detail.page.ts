import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Hospital } from '@core/models/hospital.model';
import { HospitalService } from '@core/services/hospital.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { MapViewComponent } from '@shared/components/map-view/map-view.component';

@Component({
  selector: 'll-hospital-detail-page',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    LoadingSpinnerComponent, MapViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      @if (hospital(); as h) {
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-6">
            <div class="flex items-start gap-4">
              <mat-icon class="text-blood-600 !text-4xl !w-10 !h-10">local_hospital</mat-icon>
              <div class="flex-1">
                <h1 class="text-2xl font-bold">{{ h.name }}</h1>
                <p class="text-sm text-gray-500">
                  {{ h.location.address?.line1 }}, {{ h.location.address?.city }}
                </p>
                <div class="mt-2 flex flex-wrap gap-1">
                  @if (h.emergency24x7) { <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">24×7 Emergency</span> }
                  @if (h.hasBloodBank) { <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Blood Bank</span> }
                  @for (s of h.specialties ?? []; track s) {
                    <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800">{{ s }}</span>
                  }
                </div>
              </div>
              <a mat-flat-button color="warn" [href]="'tel:' + h.phone">
                <mat-icon>call</mat-icon> Call
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-6">
            <h2 class="font-semibold mb-3">Location</h2>
            <ll-map-view [center]="h.location" [zoom]="14" [height]="320"
                         [markers]="[{ point: h.location, title: h.name }]" />
          </mat-card-content>
        </mat-card>
      } @else {
        <ll-loading-spinner label="Loading hospital…" />
      }
    </div>
  `,
})
export class HospitalDetailPage implements OnChanges {
  private readonly svc = inject(HospitalService);
  @Input() id?: string;
  readonly hospital = signal<Hospital | undefined>(undefined);

  ngOnChanges(): void {
    if (this.id) this.svc.getById(this.id).subscribe((h) => this.hospital.set(h));
  }
}
