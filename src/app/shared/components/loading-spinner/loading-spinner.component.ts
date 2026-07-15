import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'll-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-8" role="status" aria-live="polite">
      <mat-spinner [diameter]="diameter" color="warn" />
      @if (label) { <span class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</span> }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() diameter = 40;
  @Input() label?: string;
}
