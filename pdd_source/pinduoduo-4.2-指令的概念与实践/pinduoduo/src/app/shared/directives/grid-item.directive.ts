import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

/**
 * 指令可以理解为没有模版的组件，它需要一个宿主元素。
 * 推荐使用方括号 [] 指定 Selector，虽然这个不是必须的。
 */
@Directive({
  selector: '[appGridItem]'
})
export class GridItemDirective implements OnInit {
  constructor(private elr: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.setStyle('display', 'grid');
    // 给出网格的模版，默认情况下是一个堆叠的布局，给出一个网格的两个构成部分的命名: image 和 title
    this.setStyle('grid-template-areas', `'image' 'title'`);
    this.setStyle('place-items', 'center');
    this.setStyle('width', '4.3rem');
  }

  private setStyle(styleName: string, styleValue: string | number) {
    this.renderer.setStyle(this.elr.nativeElement, styleName, styleValue);
  }
}
