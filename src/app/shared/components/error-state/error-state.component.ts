import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'll-error-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center text-center py-10 px-6">
      <mat-icon class="!text-5xl text-red-500">error_outline</mat-icon>
      <h3 class="mt-3 text-lg font-medium">{{ title }}</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">{{ message }}</p>
      @if (retryLabel) {
        <button mat-flat-button color="warn" class="mt-4" (click)="retry.emit()">
          {{ retryLabel }}
        </button>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'Please try again in a moment.';
  @Input() retryLabel?: string = 'Try again';
  @Output() readonly retry = new EventEmitter<void>();
}
