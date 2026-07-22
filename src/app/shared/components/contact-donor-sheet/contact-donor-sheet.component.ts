import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RankedDonor } from '@core/models/donor.model';
import { AnalyticsService } from '@core/services/analytics.service';
import { BloodGroupBadgeComponent } from '../blood-group-badge/blood-group-badge.component';

type Channel = 'call' | 'sms' | 'whatsapp';

/**
 * Bottom sheet offering call / SMS / WhatsApp actions for a donor.
 * Each choice records an analytics event so we can measure which channel donors
 * actually respond to.
 */
@Component({
  selector: 'll-contact-donor-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, MatButtonModule, MatIconModule, BloodGroupBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">
      <div class="flex items-center gap-3 mb-4">
        <ll-blood-group-badge [value]="ranked.donor.bloodGroup" size="md" />
        <div>
          <div class="font-semibold">{{ ranked.donor.fullName }}</div>
          <div class="text-xs text-gray-500">{{ ranked.donor.phone }}</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button mat-stroked-button class="!h-20 !flex-col" (click)="pick('call')">
          <mat-icon class="!text-3xl !w-8 !h-8 text-blood-600">call</mat-icon>
          <span class="text-xs mt-1">Call</span>
        </button>
        <button mat-stroked-button class="!h-20 !flex-col" (click)="pick('sms')">
          <mat-icon class="!text-3xl !w-8 !h-8 text-blue-600">sms</mat-icon>
          <span class="text-xs mt-1">SMS</span>
        </button>
        <button mat-stroked-button class="!h-20 !flex-col" (click)="pick('whatsapp')">
          <mat-icon class="!text-3xl !w-8 !h-8 text-emerald-600">chat</mat-icon>
          <span class="text-xs mt-1">WhatsApp</span>
        </button>
      </div>

      <p class="text-xs text-gray-500 text-center mt-4">
        The donor consented to be contacted for emergencies. Please be respectful.
      </p>
    </div>
  `,
})
export class ContactDonorSheet {
  readonly ranked: RankedDonor;
  private readonly analytics = inject(AnalyticsService);

  constructor(
    private readonly ref: MatBottomSheetRef<ContactDonorSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA) data: { ranked: RankedDonor },
  ) {
    this.ranked = data.ranked;
  }

  pick(channel: Channel): void {
    const phone = this.ranked.donor.phone.replace(/\s+/g, '');
    const url =
      channel === 'call'     ? `tel:${phone}` :
      channel === 'sms'      ? `sms:${phone}` :
      /* whatsapp */           `https://wa.me/${phone.replace(/^\+/, '')}`;

    this.analytics.track({
      name: 'donor.contacted',
      props: { donorId: this.ranked.donor.id, channel },
    });

    window.open(url, '_blank');
    this.ref.dismiss();
  }
}
