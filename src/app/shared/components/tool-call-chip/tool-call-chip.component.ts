import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface ToolCallEvent {
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

const TOOL_ICONS: Record<string, string> = {
  search_donors:        'search',
  find_hospitals:       'local_hospital',
  check_eligibility:    'verified',
  predict_availability: 'psychology',
  notify_donors:        'campaign',
};

/**
 * Renders an agent tool call as a compact expandable chip so users can see
 * what the AI actually did — not just what it said. Click to expand args/result.
 */
@Component({
  selector: 'll-tool-call-chip',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-xs my-2">
      <button
        type="button"
        (click)="open.set(!open())"
        class="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <mat-icon class="!text-lg text-blood-600">{{ icon }}</mat-icon>
        <span class="font-mono font-medium">{{ event.name }}</span>
        <span class="text-gray-500 truncate flex-1">{{ summary }}</span>
        <mat-icon class="!text-base">{{ open() ? 'expand_less' : 'expand_more' }}</mat-icon>
      </button>
      @if (open()) {
        <div class="px-3 pb-3 space-y-2 text-[11px] font-mono">
          @if (event.args) {
            <div>
              <div class="uppercase text-[10px] text-gray-500 tracking-wide mb-0.5">args</div>
              <pre class="whitespace-pre-wrap break-all">{{ argsJson }}</pre>
            </div>
          }
          @if (event.result !== undefined) {
            <div>
              <div class="uppercase text-[10px] text-gray-500 tracking-wide mb-0.5">result</div>
              <pre class="whitespace-pre-wrap break-all">{{ resultJson }}</pre>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ToolCallChipComponent {
  @Input({ required: true }) event!: ToolCallEvent;
  readonly open = signal(false);

  get icon(): string      { return TOOL_ICONS[this.event.name] ?? 'build'; }
  get argsJson(): string  { return JSON.stringify(this.event.args, null, 2); }
  get resultJson(): string { return JSON.stringify(this.event.result, null, 2); }
  get summary(): string {
    if (Array.isArray(this.event.result))                          return `${this.event.result.length} results`;
    if (this.event.result && typeof this.event.result === 'object') return `${Object.keys(this.event.result).length} fields`;
    if (typeof this.event.result === 'number')                     return String(this.event.result);
    return this.event.args ? Object.keys(this.event.args).join(', ') : '';
  }
}
