import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({ selector: '[llLongPress]', standalone: true })
export class LongPressDirective {
  @Input() longPressMs = 500;
  @Output('llLongPress') readonly longPress = new EventEmitter<void>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('pointerdown') start(): void {
    this.cancel();
    this.timer = setTimeout(() => this.longPress.emit(), this.longPressMs);
  }
  @HostListener('pointerup')    end(): void   { this.cancel(); }
  @HostListener('pointerleave') leave(): void { this.cancel(); }
  @HostListener('pointercancel') canc(): void { this.cancel(); }

  private cancel(): void {
    if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; }
  }
}
