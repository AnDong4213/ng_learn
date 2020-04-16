import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface TopMenu {
  title: string;
  link: string;
}

@Component({
  selector: 'app-scrollable-tab',
  templateUrl: './scrollable-tab.component.html',
  styleUrls: ['./scrollable-tab.component.css'],
})
export class ScrollableTabComponent implements OnInit {
  selectedIndex = -1;
  @Input() menus: TopMenu[] = [];
  @Input() backgroundColor = '#fff';
  // @Input() haha: number = null; // 可以先定义
  @Output() tabSelected = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  handleSelection(index: number) {
    console.log(index);
    this.selectedIndex = index;
    this.tabSelected.emit(this.menus[index]);
  }
}
