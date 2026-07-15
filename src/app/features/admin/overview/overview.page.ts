import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'll-admin-overview',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold">Overview</h1>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        @for (s of stats; track s.label) {
          <mat-card class="!rounded-2xl">
            <mat-card-content class="!p-4">
              <div class="text-xs text-gray-500">{{ s.label }}</div>
              <div class="text-2xl font-bold text-blood-700 mt-1">{{ s.value }}</div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
})
export class AdminOverviewPage {
  readonly stats = [
    { label: 'Total Users',   value: '1,284' },
    { label: 'Active Donors', value: '812'   },
    { label: 'Open Requests', value: '37'    },
    { label: 'Fulfilled',     value: '1,102' },
  ];
}
