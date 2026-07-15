import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { BloodGroup } from '@core/models/blood-group.enum';

@Component({
  selector: 'll-blood-group-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center justify-center rounded-full font-semibold tracking-wide"
      [class]="classes()"
    >
      {{ label() }}
    </span>
  `,
})
export class BloodGroupBadgeComponent {
  private readonly _value = signal<BloodGroup | string>('O+');
  private readonly _size  = signal<'sm' | 'md' | 'lg'>('md');

  @Input() set value(v: BloodGroup | string) { this._value.set(v); }
  @Input() set size(v: 'sm' | 'md' | 'lg')   { this._size.set(v); }

  readonly label = computed(() => String(this._value()));
  readonly classes = computed(() => {
    const base = 'bg-blood-600 text-white shadow-sm';
    const size =
      this._size() === 'sm' ? 'text-xs px-2 py-0.5 min-w-[2rem]' :
      this._size() === 'lg' ? 'text-lg px-4 py-1.5 min-w-[3rem]' :
                              'text-sm px-3 py-1  min-w-[2.5rem]';
    return `${base} ${size}`;
  });
}
