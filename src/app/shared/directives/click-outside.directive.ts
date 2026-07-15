import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';

@Directive({ selector: '[llClickOutside]', standalone: true })
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output('llClickOutside') readonly clickedOutside = new EventEmitter<Event>();

  private readonly el  = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private readonly handler = (event: Event): void => {
    if (!this.el.nativeElement.contains(event.target as Node)) this.clickedOutside.emit(event);
  };

  ngOnInit(): void  { this.doc.addEventListener('click', this.handler, true); }
  ngOnDestroy(): void { this.doc.removeEventListener('click', this.handler, true); }
}
