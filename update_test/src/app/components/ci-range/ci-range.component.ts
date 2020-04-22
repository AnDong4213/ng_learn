import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ci-range',
  templateUrl: './ci-range.component.html',
  styleUrls: ['./ci-range.component.scss']
})
export class CiRangeComponent implements OnInit {
  @Input() ci;

  constructor() { }

  ngOnInit() {
    if (!this.ci) {
      this.ci = { low: 0, high: 0 };
    }

    this.ci.low = typeof (this.ci.low) === 'number' ? this.ci.low : 0;
    this.ci.high = typeof (this.ci.high) === 'number' ? this.ci.high : 0;
  }

}

