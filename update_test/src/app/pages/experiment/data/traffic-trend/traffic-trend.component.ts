import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { ActivatedRoute } from '@angular/router';

import { Version , VersionStatus , Experiment } from '../../../../model';

import { ApiExperiment, ApiData  } from 'adhoc-api';
import { AbLodash } from '../../../../service/ab-lodash.service';
import { ABService } from '../../../../service/ab.service';
import { DataBase } from '../base.component';
import { color } from '../echarts.component';
import { CurAppService } from '../../../../service/cur-app.service';
import { IMyDrpOptions, IMyDateRangeModel, IMyDate } from 'mydaterangepicker';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-traffic-trend',
  templateUrl: './traffic-trend.component.html',
  styleUrls: ['./traffic-trend.component.scss']
})
export class TrafficTrendComponent extends DataBase implements OnInit {

  clientResult: Object;
  // index data
  indexClientResult: Object;
  indexXdate: Array<string>;
  // page data
  flowData: Object;

  // exp date
  startTime: Date;
  endTime: Date;

  by: string;
  day: string = 'day';
  hour: string = 'hour';

  isEmpty: Boolean = false;

  api: Promise<Response>;

  myDateRangePickerOptions: IMyDrpOptions;
  modelPicker: Object;

  constructor(route: ActivatedRoute,
              apiData: ApiData,
              _: AbLodash,
             ab: ABService,
             curAppService: CurAppService,
             apiExp: ApiExperiment) {
         super(route, apiData, _, ab, curAppService, apiExp);
   this.by = this.day;
  
   this.myDateRangePickerOptions = {
   };

   this.modelPicker = {};

 }

  ngOnInit() {
    super.ngOnInit();

    this.getExp(() => {
      this.modelPicker = this.initDatePicker(this.startTime, this.endTime);
      const nexDay = this.endTime;
      nexDay.setDate(nexDay.getDate());
      this.myDateRangePickerOptions['disableSince'] = {
        year: nexDay.getFullYear(),
        month: nexDay.getMonth()+1,
        day: nexDay.getDate()+1
      };
      this.initApi(this.by);
      this.getClientResult(() => {
          this.initIndexData();
          this.initFlowChartData();
      });

   });
  }

  get byType() {
    return this.by;
  }

  set byType(val) {
   this.by = val;

   this.initApi(this.by);
   this.getClientResult(() => {
        this.initIndexData();
        this.initFlowChartData();
   });
  }

  getExp(callback) {
    super.getExp(() => {
        this.startTime = new Date(this.control.start_date * 1000);

        if (this.control.status === VersionStatus.Stop ||
            this.control.status === VersionStatus.AutoStop ||
            this.control.status === VersionStatus.Publish) {

           this.endTime = new Date(this.control.end_date * 1000);
        } else {
            const d = new Date();
            d.setHours(d.getHours() + 1);
            this.endTime = new Date();
        }

        return callback();
    });
  }

  getClientResult(callback) {
    this.api.then(res => {
        this.clientResult = res;
        return callback();
    });
  }


  initIndexData() {
    this.indexClientResult = this._.groupBy(this.clientResult, 'experiment_id');
    if (this.by === this.day) {
      this.indexXdate = this._.makeDateRangeIndex(new Date(this.startTime), new Date(this.endTime));
    }

    if (this.by === this.hour) {
      const d = new Date(this.endTime);
      d.setDate(d.getDate() + 1);
      this.indexXdate = this._.makeDateTimeRangeIndex(new Date(this.startTime), new Date(d));
    }
  }


  initFlowChartData() {
    const ldata = [];
    const series = [];
    let sum = 0;
    this.versions.forEach(item => {
        const d = [];
        let idata = {};
        if (this.by === this.day) {
          idata = this._.keyByDay(this.indexClientResult[item.id], 'hour');
        }

        if (this.by === this.hour) {
          idata = this._.keyByHour(this.indexClientResult[item.id], 'hour');
        }

        this.indexXdate.forEach(dk => {
           const ii = idata[dk];
           ii ? d.push(ii.client_sum) : d.push(0);
        });

        sum += d.reduce((count, i) => count += i, 0);

        ldata.push({
            name: item.name,
            icon:  'circle'
        });

        series.push({
            name: item.name,
            type: 'line',
            smooth: true,
            showSymbol: false,
            hoverAnimation: false,
            data: d
        });
    });

    if (sum > 0) {
      this.isEmpty = true;
    }


    this.flowData = {};
      this.flowData = {
          color: color,
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            top: '5%',
            left: '5%',
            right: '5%',
            containLabel: true
          },
          legend: {
              data: ldata,
              x: 'center',
              y: 'bottom'
          },
          xAxis: {
              type: 'category',
              splitLine: {
                show: false
              },
              boundaryGap: false,
              axisLine: {
                  show: false
              },
              axisTick: {
                  show: false
              },
              axisLabel: {
                textStyle: {
                  color: '#a0a0a0'
                }
              },
              scale: true,
              data: this.indexXdate
          },
          yAxis: {
              type: 'value',
              axisLabel: {
                textStyle: {
                  color: '#a0a0a0'
                }
              },
              splitLine: {
                  lineStyle: {
                      width: 1,
                      color: '#eee',
                      type: 'solid'
                  }
              },
              axisLine: {
                  show: false
              },
              axisTick: {
                  show: false
              }
          },
          series: series
      };
  }

  initApi(byType: string) {
    if (byType === this.day) {
      this.api = this.apiData.getClientResultByDaily(this.appid, this.startTime, this.endTime)
      .then(res => res['daily_clients']);
    }
    if (byType === this.hour) {
      const d = new Date(this.endTime);
      d.setDate(this.endTime.getDate() + 2);
      this.api = this.apiData.getClientResultByHour(this.appid, this.startTime, d)
      .then(res => res['hourly_clients']);
    }
  }

  initDatePicker(expRunDate: Date, expEndDate: Date) {
    const range = {
      beginDate: {
        year:  expRunDate.getFullYear(),
        month: expRunDate.getMonth() + 1,
        day: expRunDate.getDate()
        },
      endDate: {
        year:  expEndDate.getFullYear(),
        month: expEndDate.getMonth() + 1,
        day: expEndDate.getDate()
      }
    };
    return range;
  }

  onDateRangeChanged(e: IMyDateRangeModel) {
   this.startTime = e.beginJsDate;
   this.endTime = e.endJsDate;

   this.initApi(this.by);
   this.getClientResult(() => {
        this.initIndexData();
        this.initFlowChartData();
   });
  }

}


