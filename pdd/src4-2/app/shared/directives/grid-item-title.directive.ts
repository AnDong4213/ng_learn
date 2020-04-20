import { Directive, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appGridItemTitle]'
})
export class GridItemTitleDirective implements OnInit {
  @Input() appGridItemTitle = '0.5rem';
  constructor(private elr: ElementRef, private renderer: Renderer2) {}
  ngOnInit(): void {
    // 声明自己占据模版中的 title 区块
    this.setStyle('grid-area', 'title');
    this.setStyle('font-size', this.appGridItemTitle);
  }

  private setStyle(styleName: string, styleValue: string | number) {
    this.renderer.setStyle(this.elr.nativeElement, styleName, styleValue);
  }
}
