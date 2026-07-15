import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const DEFAULT_MESSAGES: Record<string, (err: unknown) => string> = {
  required:      () => 'This field is required.',
  email:         () => 'Enter a valid email address.',
  minlength:     (e: any) => `Must be at least ${e.requiredLength} characters.`,
  maxlength:     (e: any) => `Must be at most ${e.requiredLength} characters.`,
  phone:         () => 'Enter a valid phone number.',
  bloodGroup:    () => 'Choose a valid blood group.',
  donorAge:      (e: any) => `Age must be between ${e.min} and ${e.max}. You are ${e.actual}.`,
  weakPassword:  () => 'Password needs 8+ chars with letters and numbers.',
  mismatch:      () => 'Passwords do not match.',
};

/** Renders the first active error for a control — only after it's been touched. */
@Component({
  selector: 'll-form-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <span class="text-xs text-red-600">{{ message() }}</span>
    }
  `,
})
export class FormErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;

  message(): string | null {
    const c = this.control;
    if (!c || !c.errors || (!c.touched && !c.dirty)) return null;
    const [key, value] = Object.entries(c.errors)[0]!;
    const fn = DEFAULT_MESSAGES[key];
    return fn ? fn(value) : `Invalid: ${key}`;
  }
}
