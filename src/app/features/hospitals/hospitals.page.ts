import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Hospital } from '@core/models/hospital.model';
import { HospitalService } from '@core/services/hospital.service';
import { LocationService } from '@core/services/location.service';
import { HospitalCardComponent } from '@shared/components/hospital-card/hospital-card.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MapViewComponent, MapMarker } from '@shared/components/map-view/map-view.component';

type ViewMode = 'list' | 'map';

@Component({
  selector: 'll-hospitals-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonToggleModule, MatChipsModule, MatIconModule,
    HospitalCardComponent, LoadingSpinnerComponent, EmptyStateComponent, MapViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-6xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 class="text-2xl font-bold">Nearby Hospitals</h1>
          <p class="text-sm text-gray-500">Sorted by distance from your current location.</p>
        </div>
        <mat-button-toggle-group [(ngModel)]="view" hideSingleSelectionIndicator>
          <mat-button-toggle value="list"><mat-icon>view_list</mat-icon></mat-button-toggle>
          <mat-button-toggle value="map"><mat-icon>map</mat-icon></mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <mat-chip-listbox multiple [(ngModel)]="filters" (ngModelChange)="filtersSignal.set($event ?? [])" class="mb-4">
        <mat-chip-option value="emergency">24×7 Emergency</mat-chip-option>
        <mat-chip-option value="bloodBank">Has Blood Bank</mat-chip-option>
      </mat-chip-listbox>

      @if (loading()) {
        <ll-loading-spinner label="Finding hospitals…" />
      } @else if (filtered().length === 0) {
        <ll-empty-state icon="search_off" title="No hospitals match"
          message="Try clearing filters or increasing your search radius." />
      } @else if (view === 'map') {
        <ll-map-view [height]="480" [markers]="markers()" />
      } @else {
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          @for (h of filtered(); track h.id) {
            <a [routerLink]="['/hospitals', h.id]" class="block no-underline text-inherit">
              <ll-hospital-card [hospital]="h" />
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class HospitalsPage implements OnInit {
  private readonly svc = inject(HospitalService);
  private readonly loc = inject(LocationService);

  readonly items   = signal<Hospital[]>([]);
  readonly loading = signal(true);
  view: ViewMode = 'list';
  filters: string[] = [];

  readonly filtersSignal = signal<string[]>([]);

  readonly filtered = computed(() => {
    const active = this.filtersSignal();
    return this.items().filter((h) =>
      (!active.includes('emergency') || h.emergency24x7) &&
      (!active.includes('bloodBank') || h.hasBloodBank),
    );
  });

  readonly markers = computed<MapMarker[]>(() =>
    this.filtered().map((h) => ({ point: h.location, title: h.name })),
  );

  ngOnInit(): void {
    this.loc.getCurrentPosition().subscribe((p) =>
      this.svc.nearby({ lat: p.lat, lng: p.lng }, 50).subscribe((list) => {
        this.items.set(list);
        this.loading.set(false);
      }),
    );
  }
}
