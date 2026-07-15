import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'll-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center py-12 px-6">
      <mat-icon class="!w-16 !h-16 !text-6xl text-gray-300 dark:text-gray-600">{{ icon }}</mat-icon>
      <h3 class="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">{{ title }}</h3>
      @if (message) {
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">{{ message }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message?: string;
}
