import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Confirmable, Emoji } from '../../decorators';

@Component({
  selector: 'app-horizontal-grid',
  templateUrl: './horizontal-grid.component.html',
  styleUrls: ['./horizontal-grid.component.css']
})
export class HorizontalGridComponent implements OnInit {
  private _username = '';
  // 注解可以应用于变量，方法和类
  @Emoji() result = '您好';
  @Output() usernameChange = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  /**
   * get / set 是属性访问限定符，如果我们对于属性的读和写有一些逻辑操作
   * 可以利用 get / set 进行处理
   */
  @Input()
  public get username(): string {
    return this._username;
  }

  public set username(value: string) {
    this._username = value;
    this.usernameChange.emit(this._username);
  }

  // 注解也可以接受参数
  @Confirmable('已经点击，是否确认执行？')
  handleClick() {
    console.log('点击已执行');
  }
}
