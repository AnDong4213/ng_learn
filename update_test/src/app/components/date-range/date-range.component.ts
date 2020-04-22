import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { VersionStatus } from '../../model';
import { IMyDrpOptions, IMyDateRangeModel, IMyDate } from 'mydaterangepicker';

import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';


@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent implements OnInit, OnChanges {
  @Input() options;
  @Input() model;
  @Input() exp;
  @Input() by;
  @Output() dateRangeChanged = new EventEmitter<IMyDateRangeModel>();
  optionsDate;
  isShow = false;
  is7Day = false;
  hour: string = 'hour';

  myDateRangePickerOptions: IMyDrpOptions;
  VersionStatus = VersionStatus;

  constructor(private translate: TranslateService) {

    this.myDateRangePickerOptions = {
      dateFormat: 'yyyy-mm-dd',
      showClearBtn: false,
      inline: true,
      showClearDateRangeBtn: false
    };

    this.translate.get(['dateRange.beginTxt',
      'dateRange.endTxt',
      'dateRange.su',
      'dateRange.mo',
      'dateRange.tu',
      'dateRange.we',
      'dateRange.th',
      'dateRange.fr',
      'dateRange.sa',
      'dateRange.jan',
      'dateRange.feb',
      'dateRange.mar',
      'dateRange.apr',
      'dateRange.may',
      'dateRange.jun',
      'dateRange.jul',
      'dateRange.aug',
      'dateRange.sep',
      'dateRange.oct',
      'dateRange.nov',
      'dateRange.dec'
    ]).subscribe(result => {
      this.myDateRangePickerOptions['selectBeginDateTxt'] = result['dateRange.beginTxt'];
      this.myDateRangePickerOptions['selectEndDateTxt'] = result['dateRange.endTxt'];

      this.myDateRangePickerOptions['dayLabels'] = {
        su: result['dateRange.su'],
        mo: result['dateRange.mo'], tu: result['dateRange.tu'], we: result['dateRange.we'],
        th: result['dateRange.th'], fr: result['dateRange.fr'], sa: result['dateRange.sa']
      };

      this.myDateRangePickerOptions['monthLabels'] = {
        1: result['dateRange.jan'], 2: result['dateRange.feb'], 3: result['dateRange.mar'],
        4: result['dateRange.apr'], 5: result['dateRange.may'], 6: result['dateRange.jun'],
        7: result['dateRange.jul'], 8: result['dateRange.aug'], 9: result['dateRange.sep'],
        10: result['dateRange.oct'], 11: result['dateRange.nov'], 12: result['dateRange.dec']
      };

    });

  }

  ngOnInit() {


  }

  initDateByExp() {
    this.check7Day();
  }

  ngOnChanges(val) {
    if (val.hasOwnProperty('model')) {
      this.initDateFormate();
    }
    if (val.hasOwnProperty('exp') && this.exp) {
      this.initDateByExp();
    }


    this.optionsDate = { ...this.myDateRangePickerOptions, ...this.options };

  }

  initDateFormate() {
    let dateStr = '';
    if (this.model.beginDate && this.model.endDate) {
      dateStr += `${this.model.beginDate.year}-${this.model.beginDate.month}-${this.model.beginDate.day}`;
      dateStr += ` - `;
      dateStr += `${this.model.endDate.year}-${this.model.endDate.month}-${this.model.endDate.day}`;
    }
    this.model.formatted = dateStr;

  }

  initFormateJsDate() {

    const begin = new Date();
    begin.setFullYear(this.model.beginDate.year);
    begin.setMonth(this.model.beginDate.month - 1);
    begin.setDate(this.model.beginDate.day);
    begin.setHours(0);
    begin.setMinutes(0);
    this.model.beginJsDate = begin;

    const end = new Date();
    end.setFullYear(this.model.endDate.year);
    end.setMonth(this.model.endDate.month - 1);
    end.setDate(this.model.endDate.day);
    end.setHours(0);
    end.setMinutes(0);
    this.model.endJsDate = end;

  }

  dateChange(e: IMyDateRangeModel) {

    let thisEndTime = e.endJsDate

    // 当具体选择某两天查看的方式是时的时加一天
    if (this.by === this.hour) {
      let datetimeStr = thisEndTime.getFullYear() + "-" + (thisEndTime.getMonth() + 1) + "-" +
        (thisEndTime.getDate()) + ' ' + thisEndTime.getHours() + ":" + thisEndTime.getMinutes() + ":" + thisEndTime.getSeconds();
      e.endJsDate = new Date(datetimeStr);
    }

    this.dateRangeChanged.emit(e);
    this.close();
  }

  close() {
    this.isShow = false;
  }

  toggle() {
    this.isShow = !this.isShow;
  }

  beginToNow() {
    const startDate = new Date(this.exp.control.start_date * 1000);
    const endDate = new Date();
    this.model = this.initDatePicker(startDate, endDate);
    this.initDateFormate();
    this.initFormateJsDate();
    this.dateChange(this.model);
  }

  check7Day() {
    const startDate = new Date(this.exp.control.start_date * 1000);
    const c = (Date.now() - startDate.getTime()) / 24 / 60 / 60 / 1000;
    if (c >= 7) {
      this.is7Day = true;
    }
  }

  last7Day() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    this.model = this.initDatePicker(startDate, endDate);
    this.initDateFormate();
    this.initFormateJsDate();
    this.dateChange(this.model);
  }

  lastToEnd() {
    const startDate = new Date(this.exp.control.start_date * 1000);
    const endDate = new Date(this.exp.control.end_date * 1000);
    this.model = this.initDatePicker(startDate, endDate);
    this.initDateFormate();
    this.initFormateJsDate();
    this.dateChange(this.model);

  }

  initDatePicker(expRunDate: Date, expEndDate: Date) {

    const range = {
      beginDate: {
        year: expRunDate.getFullYear(),
        month: expRunDate.getMonth() + 1,
        day: expRunDate.getDate()
      },
      endDate: {
        year: expEndDate.getFullYear(),
        month: expEndDate.getMonth() + 1,
        day: expEndDate.getDate()
      }
    };

    return range;
  }

}
