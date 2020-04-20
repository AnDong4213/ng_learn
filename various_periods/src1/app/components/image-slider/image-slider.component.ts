import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  Renderer2,
} from '@angular/core';

export interface ImageSlider {
  imgUrl: string;
  link: string;
  caption: string;
}

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.css'],
})
export class ImageSliderComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() sliders: ImageSlider[] = [];
  @ViewChild('imageSlider', { static: true }) imgSlider: ElementRef; // 没在ng-for,ng-if下就是true
  @ViewChildren('img') imgs: QueryList<ElementRef>;
  @Input() sliderHeight = '160px';
  @Input() intervalBySeconds = 2;
  selectedIndex = 0;
  intervalId;

  constructor(private rd2: Renderer2) {
    console.log('constructor--组件构造image-slider');
  }

  ngOnInit() {
    console.log('ngOnInit', this.imgSlider);
    // this.imgSlider.nativeElement.innerHTML = `<span>Hello</span>`;
    console.log('rd2', this.rd2);
  }

  ngOnDestroy(): void {
    // clearInterval(this.intervalId);
  }

  ngAfterViewInit(): void {
    console.log('ngOnInit', this.imgs);
    // this.imgs.forEach((item) => (item.nativeElement.style.height = '100px'));
    /* this.imgs.forEach((item) => {
      this.rd2.setStyle(item.nativeElement, 'height', '100px');
    }); */
    /* this.intervalId = setInterval(() => {
      this.rd2.setProperty(
        this.imgSlider.nativeElement,
        'scrollLeft',
        (this.getIndex(++this.selectedIndex) *
          this.imgSlider.nativeElement.scrollWidth) /
          this.sliders.length
      );
    }, this.intervalBySeconds * 1000); */
  }

  getIndex(idx: number): number {
    return idx >= 0
      ? idx % this.sliders.length
      : this.sliders.length - (Math.abs(idx) % this.sliders.length);
  }

  handleScroll(ev) {
    const ratio =
      ev.target.scrollLeft / (ev.target.scrollWidth / this.sliders.length);
    this.selectedIndex = Math.round(ratio);
  }
}
