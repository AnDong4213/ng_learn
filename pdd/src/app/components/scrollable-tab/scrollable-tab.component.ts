import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';

export interface TopMenu {
  title: string;
  link: string;
}

@Component({
  selector: 'app-scrollable-tab',
  templateUrl: './scrollable-tab.component.html',
  styleUrls: ['./scrollable-tab.component.css'],
})
export class ScrollableTabComponent
  implements
    OnInit,
    OnChanges,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy {
  selectedIndex = -1;
  @Input() menus: TopMenu[] = [];
  @Input() backgroundColor = '#fff';
  // @Input() haha: number = null; // 可以先定义
  @Input() tilteActiveColor = 'yellow';
  @Input() titleColor = 'blue';
  @Input() indicatorColor = 'brown';

  @Output() tabSelected = new EventEmitter();

  constructor() {
    console.log('constructor--组件构造');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges--组件输入属性改变: ', changes);
  }

  ngOnInit(): void {
    console.log('ngOnInit--组件初始化');
  }

  /* ngDoCheck(): void {
    console.log('ngDoCheck--组件脏值检测--与ngOnInit不可同时出现');
  } */

  ngAfterContentInit(): void {
    console.log('ngAfterContentInit--组件内容初始化');
  }

  ngAfterContentChecked(): void {
    console.log('ngAfterContentChecked--组件内容脏值检测');
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit--组件视图初始化');
  }

  ngAfterViewChecked(): void {
    console.log('ngAfterViewChecked--组件视图脏值检测');
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy--组件销毁');
  }

  handleSelection(index: number) {
    this.selectedIndex = index;
    this.tabSelected.emit(this.menus[index]);
  }
}
