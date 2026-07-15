import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'll-history-page',
  standalone: true,
  imports: [EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold">Donation History</h1>
      <ll-empty-state icon="history" title="No donations recorded"
        message="Your past donations and matched requests will appear here." />
    </div>
  `,
})
export class HistoryPage {}
