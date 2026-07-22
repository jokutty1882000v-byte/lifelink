import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ALL_BLOOD_GROUPS, BloodGroup } from '@core/models/blood-group.enum';
import { RankedDonor } from '@core/models/donor.model';
import { AnalyticsService } from '@core/services/analytics.service';
import { LocationService } from '@core/services/location.service';
import { DonorsStore } from '@state/donors.store';
import { DonorCardComponent } from '@shared/components/donor-card/donor-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ContactDonorSheet } from '@shared/components/contact-donor-sheet/contact-donor-sheet.component';

@Component({
  selector: 'll-search-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule,
    DonorCardComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold">Find Donors</h1>
      <p class="text-sm text-gray-500">AI-ranked by distance, eligibility, availability, rating.</p>

      <form class="mt-4 flex flex-wrap items-end gap-3" (ngSubmit)="run()">
        <mat-form-field appearance="outline">
          <mat-label>Blood group needed</mat-label>
          <mat-select [(ngModel)]="bg" name="bg">
            @for (g of groups; track g) { <mat-option [value]="g">{{ g }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Radius (km)</mat-label>
          <mat-select [(ngModel)]="radius" name="radius">
            @for (r of [5, 10, 25, 50, 100]; track r) { <mat-option [value]="r">{{ r }} km</mat-option> }
          </mat-select>
        </mat-form-field>
        <button mat-flat-button color="warn" type="submit">
          <mat-icon>search</mat-icon> Search
        </button>
      </form>

      <div class="mt-6">
        @if (store.loading()) {
          <ll-loading-spinner label="Ranking donors…" />
        } @else if (store.results().length === 0) {
          <ll-empty-state icon="search_off" title="No results yet"
            message="Pick a blood group and search to see AI-ranked donors near you." />
        } @else {
          <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live — availability updates every 30s
            @if (store.lastLiveTick()) { · last change now }
          </div>
          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            @for (r of store.results(); track r.donor.id) {
              <ll-donor-card [ranked]="r" [radiusKm]="radius"
                             (view)="viewDetails($event)" (contact)="contact($event)" />
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class SearchPage implements OnInit {
  readonly store = inject(DonorsStore);
  private readonly location  = inject(LocationService);
  private readonly analytics = inject(AnalyticsService);
  private readonly sheet     = inject(MatBottomSheet);
  private readonly router    = inject(Router);

  readonly groups = ALL_BLOOD_GROUPS;
  bg: BloodGroup = BloodGroup.O_POS;
  radius = 25;

  ngOnInit(): void { this.location.getCurrentPosition().subscribe(); }

  run(): void {
    const loc = this.location.current() ?? { lat: 19.076, lng: 72.8777 };
    this.store.search({
      bloodGroup: this.bg,
      origin: { lat: loc.lat, lng: loc.lng },
      radiusKm: this.radius,
      onlyEligible: true,
      onlyAvailable: true,
    });
    this.analytics.track({
      name: 'search.performed',
      props: { bloodGroup: this.bg, radiusKm: this.radius, results: this.store.results().length },
    });
  }

  viewDetails(r: RankedDonor): void { this.router.navigate(['/donors', r.donor.id]); }

  contact(r: RankedDonor): void {
    this.sheet.open(ContactDonorSheet, { data: { ranked: r } });
  }
}
