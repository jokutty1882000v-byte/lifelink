import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Donation, DonationStatus } from '@core/models/donation.model';
import { DonationService } from '@core/services/donation.service';
import { BloodGroupBadgeComponent } from '@shared/components/blood-group-badge/blood-group-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';

const STATUS_STYLES: Record<DonationStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
  cancelled: 'bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-gray-200',
  deferred:  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
};

@Component({
  selector: 'll-history-page',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    BloodGroupBadgeComponent, EmptyStateComponent, LoadingSpinnerComponent, TimeAgoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto">
      <header class="mb-4">
        <h1 class="text-2xl font-bold">Donation History</h1>
        <p class="text-sm text-gray-500">Your past and upcoming donations, oldest hidden by default.</p>
      </header>

      <section class="grid grid-cols-3 gap-3 mb-6">
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-4">
            <div class="text-xs text-gray-500">Total donations</div>
            <div class="text-2xl font-bold text-blood-700 mt-1">{{ completedCount() }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-4">
            <div class="text-xs text-gray-500">Units contributed</div>
            <div class="text-2xl font-bold text-blood-700 mt-1">{{ totalUnits() }}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="!rounded-2xl">
          <mat-card-content class="!p-4">
            <div class="text-xs text-gray-500">Lives touched</div>
            <div class="text-2xl font-bold text-blood-700 mt-1">{{ completedCount() * 3 }}</div>
          </mat-card-content>
        </mat-card>
      </section>

      @if (loading()) {
        <ll-loading-spinner label="Loading history…" />
      } @else if (items().length === 0) {
        <ll-empty-state icon="history" title="No donations yet"
          message="Your future donations will show up here as a timeline." />
      } @else {
        <ol class="relative border-l-2 border-blood-200 dark:border-blood-900 pl-6 space-y-4">
          @for (d of items(); track d.id) {
            <li class="relative">
              <span class="absolute -left-[34px] top-3 w-4 h-4 rounded-full bg-blood-600 ring-4 ring-white dark:ring-neutral-900"></span>
              <mat-card class="!rounded-2xl">
                <mat-card-content class="!p-4">
                  <div class="flex items-start gap-3">
                    <ll-blood-group-badge [value]="d.bloodGroup" size="md" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <h3 class="font-medium truncate">
                          {{ d.hospitalName ?? d.bloodBankName ?? 'Blood donation' }}
                        </h3>
                        <span class="text-xs text-gray-500">{{ d.donatedAt | timeAgo }}</span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5">
                        {{ d.units }} unit(s) · {{ formatDate(d.donatedAt) }}
                      </p>
                      <div class="mt-2 flex items-center gap-2">
                        <span class="text-[11px] px-2 py-0.5 rounded-full" [class]="statusClass(d.status)">
                          {{ d.status }}
                        </span>
                        @if (d.notes) {
                          <span class="text-xs text-gray-500 italic truncate">{{ d.notes }}</span>
                        }
                      </div>
                    </div>
                    @if (d.certificateUrl && d.status === 'completed') {
                      <a mat-stroked-button [href]="d.certificateUrl" download>
                        <mat-icon>download</mat-icon> Cert.
                      </a>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </li>
          }
        </ol>
      }
    </div>
  `,
})
export class HistoryPage implements OnInit {
  private readonly svc = inject(DonationService);
  readonly items   = signal<Donation[]>([]);
  readonly loading = signal(true);

  readonly completedCount = computed(() => this.items().filter((d) => d.status === 'completed').length);
  readonly totalUnits     = computed(() =>
    this.items().filter((d) => d.status === 'completed').reduce((s, d) => s + d.units, 0),
  );

  ngOnInit(): void {
    this.svc.list().subscribe((list) => { this.items.set(list); this.loading.set(false); });
  }

  statusClass(s: DonationStatus): string { return STATUS_STYLES[s]; }
  formatDate(iso: string): string { return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }); }
}
