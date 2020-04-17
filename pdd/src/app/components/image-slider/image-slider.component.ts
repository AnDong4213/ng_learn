import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

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
export class ImageSliderComponent implements OnInit {
  @Input() sliders: ImageSlider[] = [];
  @ViewChild('imageSlider', { static: true }) imgSlider: ElementRef; // 没在ng-for,ng-if下就是true

  constructor() {}

  ngOnInit() {
    console.log('ngOnInit', this.imgSlider);
    this.imgSlider.nativeElement.innerHTML = `<span>Hello</span>`;
  }
}
