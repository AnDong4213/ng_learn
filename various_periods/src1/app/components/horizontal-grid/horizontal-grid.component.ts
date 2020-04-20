import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-horizontal-grid',
  templateUrl: './horizontal-grid.component.html',
  styleUrls: ['./horizontal-grid.component.css'],
})
export class HorizontalGridComponent implements OnInit {
  // username = '';
  private _username = '搜索时';
  @Output() usernameChange = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  /**
   * get / set 是属性访问限定符，如果我们对于属性的读和写有一些逻辑操作
   * 可以利用 get / set 进行处理
   */
  @Input() public get username(): string {
    return this._username;
  }

  public set username(value: string) {
    console.log(value);
    this._username = value;
    this.usernameChange.emit(this._username);
  }
}
