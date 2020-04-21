import {
  Component,
  OnInit,
  AfterViewChecked,
  NgZone,
  ViewChild,
  ElementRef,
  Renderer2,
  Input
} from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css']
})
export class ChildComponent implements OnInit, AfterViewChecked {
  _title = 'hi';

  @Input()
  public get title(): string {
    console.log('子组件脏值检测');
    return this._title;
  }

  public set title(v: string) {
    this._title = v;
  }

  public get time(): number {
    /**
     * 如果写成下面的代码就会出现异常
     * 这是由于脏值检测是一个单向的同步的检测过程，而且会进行两次检查
     * 这会导致下面的结果在两次检查中值是不一样的，所以会抛出异常
     *
     * ```ts
     * return Date.now()
     * ```
     */
    return this._time;
  }

  public set time(v: number) {
    this._time = v;
  }

  constructor(ngZone: NgZone, rd: Renderer2) {
    /**
     * 引发脏值检测的无限循环，当然如果不是性能出现很大的问题，这样做也可以。
     * 只是需要牢记这种方式可能引发的性能问题。
     *
     * ```ts
     * setInterval(() => {
     *   this.time = Date.now();
     *   cd.markForCheck();
     * }, 100);
     * ```
     *
     * 如果我们不使用绑定，而直接操作 DOM 就没有问题，这是解决方案之一
     *
     * ```ts
     * setInterval(() => {
     *   rd.setProperty(
     *     this.timeRef.nativeElement,
     *     'innerText',
     *     // 管道使用的变换函数也可以直接在类中使用
     *     // 下面的 formatDate 就是 DatePipe 的变换函数
     *     formatDate(Date.now(), 'HH:mm:ss:SSS', 'zh-Hans')
     *   );
     * }, 100);
     * ```
     *
     * zone.js 提供了在一个浏览器应用中使用不同的运行时上下文的能力
     * NgZone 可以通过依赖注入得到
     * runOutsideAngular 是
     */
    // ngZone.runOutsideAngular(() => {
    //   setInterval(() => {
    //     this._time = Date.now();
    //   }, 1);
    // });
  }
  // @ViewChild('timeRef', { static: true })
  // timeRef: ElementRef;
  _time: number;

  ngAfterViewChecked(): void {
    // 在此处会抛出异常，不要在 ngAfterViewChecked
    // 或者 ngAfterViewInit 中去改变属性值
    // this.title = 'hello';
  }

  ngOnInit() {
    // this.title = 'hi';
  }

  /**
   * 事件是可以触发脏值检测的
   */
  handleClick() {
    // this.title = '您好';
  }
}
