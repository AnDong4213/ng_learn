import { Component, OnInit, Attribute, Input } from '@angular/core';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss']
})
export class VariantComponent implements OnInit {
  @Input() num;

  constructor() {
  }


  ngOnInit() {
  }

}

