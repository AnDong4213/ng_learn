import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-color-dot',
  templateUrl: './color-dot.component.html',
  styleUrls: ['./color-dot.component.scss']
})
export class ColorDotComponent implements OnInit {

  @Input() num;

  constructor() { }

  ngOnInit() {
    this.num++;
  }

}

