import { Component, OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Version , VersionStatus, Experiment, App, Flag } from '../../../../model';

import { IMyDrpOptions, IMyDateRangeModel, IMyDate } from 'mydaterangepicker';

import { ApiExperiment , ApiData, ApiAuth } from 'adhoc-api';
import { AbLodash } from '../../../../service/ab-lodash.service';
import { ABService } from '../../../../service/ab.service';
import { DataBase } from '../base.component';
import { color } from '../echarts.component';
import { CurAppService } from '../../../../service/cur-app.service';
import { Role } from '../../../../model/role';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-data-retention',
  templateUrl: './data-retention.component.html',
  styleUrls: ['./data-retention.component.scss']
})
export class DataRetentionComponent extends DataBase implements OnInit {
  retentionRole = [Role.retention];

  selectVersion: Version;

  STAT_TYPE_UV_MEAN = 'rate';
  STAT_TYPE_MEAN = 'num';

  statType: string;

  set styp(val) {
    this.statType = val;


    this.getNewRetainData(this.statType, (list) => {
        this.curRetentionResult = list;
        this.retainedRateFig = !this.retainedRateFig;
        this.getCurNewRetention();
    });
  }


  // exp date
  startTime: Date;
  endTime: Date;

  myDateRangePickerOptions: IMyDrpOptions;
  modelPicker: Object;

  curRetentionResult = [];


  // chart table
  barChartData = {};

  // table data
  curExpRetention = [];

  // table data
  curNewExpRetention = [];

  ldata = [];

  retainedRateFig = true;

   rstat = [{
        name: 'retention.1',
        description: '第 1 天',
        statKey: 'Clients-Retained-Daily',
        stat_Key: 'Clients-New-Daily'
      }, {
        name: 'retention.2',
        description: '第 2 天',
        statKey: 'Clients-Retained-Daily-2',
        stat_Key: 'Clients-New-Daily'
      }, {
        name: 'retention.3',
        description: '第 3 天',
        statKey: 'Clients-Retained-Daily-3',
        stat_Key: 'Clients-New-Daily'
      }, {
        name: 'retention.4',
        description: '第 4 天',
        statKey: 'Clients-Retained-Daily-4',
        stat_Key: 'Clients-New-Daily'
      }, {
        name: 'retention.5',
        description: '第 5 天',
        statKey: 'Clients-Retained-Daily-5',
        stat_Key: 'Clients-New-Daily'
      }, {
        name: 'retention.6',
        description: '第 6 天',
        statKey: 'Clients-Retained-Daily-6',
        stat_Key: 'Clients-New-Daily'
      }, {
        name: 'retention.7',
        description: '第 7 天',
        statKey: 'Clients-Retained-Daily-7',
        stat_Key: 'Clients-New-Daily'
      }];


  initBarChartsTable() {
      const config = {
          color: color,
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: this.ldata,
            x: 'center',
            y: 'bottom'
          },
          grid: {
              left: '5%',
              right: '5%',
              top: '10%',
              bottom: '25%',
              containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['次日留存', '第二天存留', '第三天存留', '第四天存留', '第五天存留', '第六天存留', '第七天存留'],
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            splitLine: {
             show: false
            },
            axisLabel: {
              textStyle: {
                color: '#a0a0a0'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false,
              interval: 4
            },
            axisTick: {
              show: false
            },
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
            }
          },
          series: []
    };
    return config;
  }

   constructor(route: ActivatedRoute,
              apiData: ApiData,
              _: AbLodash,
             ab: ABService,
             apiExp: ApiExperiment,
             private translate: TranslateService,
             curAppService: CurAppService,
             private apiAuth: ApiAuth) {
         super(route, apiData, _, ab, curAppService, apiExp);

         this.statType = this.STAT_TYPE_MEAN;

       this.myDateRangePickerOptions = {
         dateFormat: 'yyyy-mm-dd',
         showClearBtn: false
       };

       this.modelPicker = {};

  }

  ngOnInit() {
    super.ngOnInit();
    this.getExp(() => {
        this.modelPicker = this.initDatePicker(this.startTime, this.endTime);
        // this.myDateRangePickerOptions.disableUntil = {
        //   year: this.startTime.getFullYear(),
        //   month: this.startTime.getMonth(),
        //   day: this.startTime.getDate() - 1
        // };
        var nexDay = this.endTime;
        nexDay.setDate(nexDay.getDate());
        this.myDateRangePickerOptions.disableSince = {
          year: nexDay.getFullYear(),
          month: nexDay.getMonth()+1,
          day: nexDay.getDate()+1
        };

        this.getNewRetainData(this.statType, (list) => {
          this.curRetentionResult = list;
          this.getCurNewRetention();
        });

        this.getNewRetainData(this.STAT_TYPE_MEAN, (list) => {
         this.makeChartsTable(list);
        });


    });
  }

  onDateRangeChanged(e: IMyDateRangeModel) {
    this.startTime = e.beginJsDate;
    this.endTime = e.endJsDate;
    this.getNewRetainData(this.statType, (list) => {
        this.getCurNewRetention();
    });
  }

  initDatePicker(expRunDate: Date, expEndDate: Date) {
    const range = {
      beginDate: {
        year:  expRunDate.getFullYear(),
        month: expRunDate.getMonth()+1,
        day: expRunDate.getDate()
        },
      endDate: {
        year:  expEndDate.getFullYear(),
        month: expEndDate.getMonth()+1 ,
        day: expEndDate.getDate()
      }
    };
    return range;
  }

  getExp(callback) {
    super.getExp(() => {
        // init default select version
        this.selectVersion = this.versions[0];
        this.startTime = new Date();
        this.startTime.setTime(this.startTime.getTime() - (20 * 24 * 60 * 60 * 1000));

        if (this.control.status === VersionStatus.Stop ||
          this.control.status === VersionStatus.AutoStop ||
          this.control.status === VersionStatus.Publish) {

           const et = this.control.end_date * 1000 > Date.now() ? Date.now() : this.control.end_date * 1000;
           this.endTime = new Date(et);

           this.startTime = new Date();
           this.startTime.setTime(this.endTime.getTime() - (20 * 24 * 60 * 60 * 1000));
        }else {
            const endDate = new Date();
            endDate.setDate(new Date().getDate() - 1);
            this.endTime = endDate;
        }

        return callback();
    });
  }

  switchVersion(v: Version) {
    this.selectVersion = v;

    this.getCurNewRetention();
  }

  makeChartsTable(list) {
          // itemData 代表每个留存类型，它里面包含着各个版本对此类型留存的单个颜色柱子数据。
          const series = [];
          this.versions.forEach(v => {

            const versionTableData = this.makeRaintTable(list, v, this.startTime, this.endTime);
            const indexHour = this._.keyBy(versionTableData, 'hour');
            const dateKeys = Object.keys(indexHour);

            // serid是每个颜色的柱子的具体对象。
            const serid = {
              name: '',
              data: [],
              type: 'bar',
              barWidth: 10,
              barGap: '65%',
              itemStyle: {
                normal: {
                  barBorderRadius: [5, 5, 0, 0]
                }
              }
            };

            //if (v.isControl) {
              //serid.name = '原始版本';
            //} else {
              serid.name = v.name;
            //}

            for (let i = 1; i <= 7; i++) {
              let newAddCount = 0;
              let curStatCount = 0;
              const statKeyName = 'Retained' + i;

              dateKeys.forEach(key => {
                const item = indexHour[key];
                const itemVal = item[statKeyName];
                if (itemVal && itemVal !== '-') {
                  curStatCount += typeof(item[statKeyName]) === 'number' ? item[statKeyName] : 0;
                  newAddCount += typeof(item['newData']) === 'number' ? item['newData'] : 0;
                }
              });

              const rate = (curStatCount / newAddCount).toFixed(3);
              if (rate) {
                serid.data.push(rate);
              } else {
                serid.data.push(0);
              }
            }
            this.ldata.push({
              name: v.name,
              icon:  'circle'
            });
            series.push(serid);
            const config = this.initBarChartsTable();
            config.series = series;
            this.translate.get([
              'retention.t1',
              'retention.t2',
              'retention.t3',
              'retention.t4',
              'retention.t5',
              'retention.t6',
              'retention.t7',
            ]).subscribe(dic => {
              config['xAxis']['data'] = [
                dic['retention.t1'],
                dic['retention.t2'],
                dic['retention.t3'],
                dic['retention.t4'],
                dic['retention.t5'],
                dic['retention.t6'],
                dic['retention.t7']
              ];
              this.barChartData = config;
            })
      });
  }

   getRate(val, newval) {
    if (newval === '-' && val === '') return '';
    if (newval === '-' && val === '-') return '-';
    if (newval === '-') return '-';
    if (newval && val === '') return '';
    if (newval && val === '-') return '-';

    return (val * 100).toFixed(1) + '%';
  }

  getRateFig(val, newval) {
    if (newval == '-' && val == '') return '';
    if (newval == '-' && val == '-') return '-';
    if (newval && val == '') return '';
    if (newval && val == '-') return '-';
    const num = this.retainedRateFig ? val / newval : val ;
    return Math.floor(Number.parseFloat((num * 100).toFixed(2)));
  }


  getCurNewRetention() {
   this.curNewExpRetention =  this.makeRaintTable(this.curRetentionResult, this.selectVersion, this.startTime, this.endTime);
  }

  makeRaintTable(datalist: Object, version: Version, start: Date, end: Date) {

      const indexStatResult = this._.keyBy(datalist, 'experiment_id');

      const curExpStat = indexStatResult[version.id].data;
      const indexStatResultsByHour = [];
      const indexSameExpResultsByHour = this._.keyBy(curExpStat, 'date');
      const indexDate = this._.makeDateRangeIndex(start, end);

      const retainedStats = [];
      indexDate.forEach(val => {
         const hourObject = {
            hour: val,
            weekhour: '',
            newWeekData: '',
            retainedWeekData: '',
            newData: '',
            Retained1: '',
            Retained2: '',
            Retained3: '',
            Retained4: '',
            Retained5: '',
            Retained6: '',
            Retained7: ''
          };

          const hourKey = val;
          const indexByStat = indexSameExpResultsByHour.hasOwnProperty(hourKey) ?
                                indexSameExpResultsByHour[hourKey] :
                                {date: hourKey, new: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0};

          let dur = this.ab.toDay(Date.now(), Date.parse(hourKey));
          dur = Math.floor(dur / 1000);
          hourObject['newData'] = indexByStat['new'] || '-';
          for (let i = 1; i <= 7; i++) {
            if (i < dur) {
              hourObject['Retained' + i] = indexByStat[i] || '-';
            }
          }
          retainedStats.push(hourObject);
      });
    return retainedStats.reverse();
  }

  getNewRetainData(typ, callback) {
      this.apiData.getNewRetain(this.exp.id, this.startTime, this.endTime, typ).then(list => {
        return callback(list);
      });
  }


}
