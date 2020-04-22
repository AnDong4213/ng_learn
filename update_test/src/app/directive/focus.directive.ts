import { Directive, Input, ElementRef, AfterViewInit, Renderer, OnInit, OnChanges } from '@angular/core';

@Directive({
  selector: '[appFocus]'
})
export class FocusDirective implements OnInit, OnChanges, AfterViewInit {

  private _autofocus;
  constructor(private el: ElementRef,
    private renderer: Renderer) {
  }

  ngOnInit() {
    if (window.navigator.userAgent.indexOf('Firefox') > 0) {
      return;
    }
    if (this._autofocus || typeof this._autofocus === 'undefined') {
      this.el.nativeElement.focus();
    }
  }

  ngOnChanges() {
    if (window.navigator.userAgent.indexOf('Firefox') > 0) {
      return;
    }
    if (this._autofocus || typeof this._autofocus === 'undefined') {
      this.el.nativeElement.focus();
    }
  }

  ngAfterViewInit() {
    if (window.navigator.userAgent.indexOf('Firefox') > 0) {
      return;
    }
    if (this._autofocus || typeof this._autofocus === 'undefined') {
      this.el.nativeElement.focus();
    }
  }

  @Input()
  set autofocus(condition: boolean) {
    this._autofocus = condition !== false;
  }

}
