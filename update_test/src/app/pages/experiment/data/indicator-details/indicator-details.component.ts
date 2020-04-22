import { Component, OnInit, Input } from '@angular/core';
import { Response } from '@angular/http';

import { ActivatedRoute } from '@angular/router';

import { Version , VersionStatus, Experiment, Stat , Role } from '../../../../model';

import { ApiExperiment , ApiData } from 'adhoc-api';
import { AbLodash } from '../../../../service/ab-lodash.service';
import { ABService } from '../../../../service/ab.service';
import { DataBase, STAT_TYPE_MEAN , STAT_TYPE_UV_MEAN, STAT_TYPE_UV, STAT_TYPE_SUM } from '../base.component';
import { CurAppService } from '../../../../service/cur-app.service';
import { RoleService } from '../../../../service/role.service';

import { color } from '../echarts.component';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IMyDrpOptions, IMyDateRangeModel, IMyDate } from 'mydaterangepicker';


@Component({
  selector: 'app-indicator-details',
  templateUrl: './indicator-details.component.html',
  styleUrls: ['./indicator-details.component.scss']
})
export class IndicatorDetailsComponent extends DataBase implements OnInit {

  @Input() expid;
  keyStatName:string;
  statKeys: Array<string>;
  curStat: string;
  selectObj: any = [];
  powerDialog = false;
  isPolynomial = false;

  STAT_TYPE_MEAN = STAT_TYPE_MEAN;
  STAT_TYPE_UV_MEAN = STAT_TYPE_UV_MEAN;
  STAT_TYPE_UV = STAT_TYPE_UV;
  STAT_TYPE_SUM = STAT_TYPE_SUM;
  // STAT_TYPE_SUM = 'sum';
  // STAT_TYPE_MEAN = 'mean';
  //
  //
  dimensionsStatus = false;
  isShowdimensionUv = false;

  statType: string;

  allStats: Array<Object>;
  // 为了给power页面提供数据
  allTableDatas: Array<Object>;

  selectedTime = false;

  isPowerRole = false;

  set curSelectStat(val) {
    this.curStat = val;
    this.selectObj = [{
      id: val,
      text: val
    }];
  }

  get curSelectStat() {
    return this.curStat;
  }

  selected(value: any): void {
    this.curSelectStat = value.id;
    this.renderCharts();
    this.makeTableByStat();
  }

  set styp(val) {
    this.statType = val;
    if (this.statType === this.STAT_TYPE_UV || this.statType === this.STAT_TYPE_UV_MEAN) {
      // this.dimensionsStatus = false;
    }else {
      // this.dimensionsStatus = true;
    }
    this.renderCharts();
    this.makeTableByStat();
  }


  // time
  by: string;
  day: string = 'day';
  hour: string = 'hour';

  set byDateType(val) {
    this.by = val;
    if (val === this.day) {
      this.dimensionsStatus = true;
    }else {
      this.dimensionsStatus = false;
    }
    this.renderCharts();
  }

  // exp date
  startTime: Date;
  endTime: Date;

  // table data
  statTable: Object = {};


  // api
  api: Observable<Response>;

    //
  statResultByCurData: Object = {};
  indexByCurStatResult: Object;
  indexXdate: Array<string>;
  statChartData: Object = {};


  myDateRangePickerOptions: IMyDrpOptions;
  modelPicker: Object;



  constructor(route: ActivatedRoute,
              apiData: ApiData,
              _: AbLodash,
             ab: ABService,
             curAppService: CurAppService,
             private roleService: RoleService,
             apiExp: ApiExperiment) {
         super(route, apiData, _, ab, curAppService, apiExp);
         this.statKeys = new Array<string>();
         this.statType = STAT_TYPE_MEAN;
         this.by = this.day;

         this.myDateRangePickerOptions = {
          disableSince:{
            year: 0,
            month: 0,
            day: 0
        }
         };

         this.modelPicker = {
            
         };
    }

   ngOnInit() {
    super.ngOnInit();
    
    this.getExp(async ()=>{

      this.modelPicker = this.initDatePicker(this.startTime, this.endTime);
      const nexDay = this.endTime;
      nexDay.setDate(nexDay.getDate());
      this.myDateRangePickerOptions.disableSince = {
        year: nexDay.getFullYear(),
        month: nexDay.getMonth()+1,
        day: nexDay.getDate()+1
      };
      const Statres = await this.apiData.getStatResult(this.appid)
      
      this.statResult = Statres['results'];
      
      const Clientres = await this.apiData.getClientResult(this.appid);
      this.clientResult = Clientres['clients'];

      const isPowerRole = await this.roleService.checkRole(Role.power)
      this.isPowerRole = isPowerRole;

      const resKeyName = await this.apiData.getKeyStat(this.expid)
      if(!resKeyName['error_code']){
        this.keyStatName = resKeyName['result'].indicators;
      }
      

      this.getStats(() => {
        this.initIndexData();
        this.statKeys = this.exp.control.stats;
        this.groupStats(this.allStats);
        this.statKeys.sort((a, b) => {
          if (a.length === b.length) {
            return 0;
          }
          return a.length > b.length ? 1 : -1;
        });

        if (this.statKeys.length > 0) {
          if (this.keyStatName){
            this.curSelectStat = this.statKeys.filter(stat => stat === this.keyStatName)[0];
              if (!this.curSelectStat) {
             this.curSelectStat = this.statKeys[0];
            }
            
          }else{
            this.curSelectStat = this.statKeys[0]
          }

          this.makeTableByStat();
          // 开启
          this.dimensionsStatus = true;
          this.renderCharts();
        }

      });
    })
    
        
  }

  groupStats(stats) {
    this.statKeys = this.statKeys.filter(val => val && !val.startsWith('Event-'));
    
    let filterStats = stats.filter(item => this.statKeys.includes(item.name) && item['formula'])
    
    if(filterStats.length){
      
      this.isPolynomial = filterStats[0]['formula'].split("+").length >2 ? true : false;
      
    }
    
    this.statKeys = stats.filter(s => this.statKeys.includes(s.name) && !s.formula
    ).reduce((names: Array<string>, s) => {
      names.push(s.name);
      return names;
    }, []);
    
  }

  getStats(callback) {
    this.apiData.getStat(this.exp['app_id']).then(res => {
      this.allStats = res;
      return callback();
    });
  }

  makeTableByStat(dimensions?, data?) {
    if (dimensions) {
      this.makeTable(data);
    } else {
      this.getMetricsTableResult(res => {
        this.makeTable(res);
      });
    }
  }

  getExp(callback) {
    super.getExp(() => {
        this.startTime = new Date(this.control.start_date * 1000);

        if (this.control.status === VersionStatus.Stop || this.control.status === VersionStatus.AutoStop || this.control.status === VersionStatus.Publish) {
           this.endTime = new Date(this.control.end_date * 1000);
        }else {
            this.endTime = new Date();
        }

        return callback();
    });
  }

  makeTable(res) {
    this.allTableDatas = res;
    res.forEach(r => {
      this.statTable[r.epx_id] = {
        pv: r.client_sum,
        stat: r.uv, // 转化人数
        statRate: r.uv_mean, // 转化率
        statSum: r.sum, // 总值
        statMean: r.mean, // 均值
        statVariance: r.mean_variant,
        statCi: {
          'low': r.mean_ci_low,
          'high': r.mean_ci_high,
        }
      };
      if (this.statType === this.STAT_TYPE_UV || this.statType === this.STAT_TYPE_UV_MEAN) {
        this.statTable[r.epx_id]['statVarianceRate'] =  r.uv_mean_variant;
        this.statTable[r.epx_id]['statCiRate'] = {
         'low': r.uv_mean_ci_low,
         'high': r.uv_mean_ci_high,
        };
      }

      // if (this.isShowdimensionUv) {
      //   const indexresult = this._.keyBy(this.indexStatResult['BtnClick'], 'experiment_id');
      //   this.statTable[r.epx_id]['dimensionUv'] = indexresult[r.id] ? indexresult[r.id].uv : 0;
      // }
    });
  }

  initStatChartData(dimensions?, data?) {
    if (dimensions) {
      this.initStatChart(data);
    } else {
      this.getMetricsResult(res => {
        this.initStatChart(res);
      });
    }

  }

  initStatChart(res) {
    const ldata = [];
    const series = [];
    let key = Object.keys(res[0].data);
   
    key.sort((a, b) => {
      if (a === b) {
        return 0;
      }
      return a > b ? 1 : -1;
    });


    //将数据从新排序，把控制版本放在第一个
    let controlArr = new Array();
    let expArr = new Array();
    res.forEach(r => {
      if (r.experiment_id == this.exp.control.id) {
        controlArr.push(r);
      } else {
        expArr.push(r);
      }
    });
    controlArr.push.apply(controlArr, expArr);

    controlArr.forEach(item => {
      const d = [];

      let timeLine = new Array<string>();
     
      key.forEach(k => {

        d.push(this.statType === this.STAT_TYPE_MEAN ? item.data[k].mean :this.statType === this.STAT_TYPE_UV_MEAN ? item.data[k].uv_mean :this.statType === this.STAT_TYPE_SUM ? item.data[k].sum :this.statType === this.STAT_TYPE_UV ? item.data[k].uv : null);

        timeLine.push(this.by === this.day ? this._.getDateStr(new Date(k)) : this._.getDateTimeStr(new Date(k)));
      });
      
      this.indexXdate = timeLine;

      ldata.push({
          name: item.experiment_name,
          icon:  'circle'
      });

      series.push({
          name: item.experiment_name,
          type: 'line',
          smooth: true,
          showSymbol: false,
          hoverAnimation: false,
          data: d
      });
    });

    this.statChartData = {};
    this.statChartData = {
        color: color,
        tooltip: {
          trigger: 'axis',
          formatter: (arr) => {
            let showStr = '';
            let once = 0;
            arr.map((item) => {
              if (once === 0) {
                showStr += item.axisValueLabel + '<br />';
                once++;
              }
              let num = typeof(item.value) === 'number' ? item.value.toFixed(3) : 0;
              if (this.statType === this.STAT_TYPE_UV_MEAN) {
                 num = num * 100;
                 num = num.toFixed(1) + '%';
              }

              if(this.statType === this.STAT_TYPE_SUM || this.statType === this.STAT_TYPE_UV){

                num = parseInt(num);
              }
              showStr += item.marker + ' ' + item.seriesName + ' : ' + num + ' <br/>';
            });
            return showStr;
          }
        },
        grid: {
          top: '10%',
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

  //最先执行这个方法
  renderCharts() {
    this.initStatChartData();
  }

  onDateRangeChanged(e: IMyDateRangeModel) {
    this.selectedTime = true;
   this.startTime = e.beginJsDate;
   this.endTime = e.endJsDate;
   //时间选择和维度互斥 TODO
   this.renderCharts();
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
        month: expEndDate.getMonth()+1,
        day: expEndDate.getDate()
      }
    };
    return range;
  }

  openPowerDialog(v) {
    if (this.isPowerRole) {
      v.powerDialog = true;
    }
  }

  closePowerDialog(v) {
    v.powerDialog = false;
  }


  // child component call
  dimensionTable(data) {
    this.isShowdimensionUv = true;
    this.statResult = data.results;
    this.initIndexData();
    this.makeTableByStat(true, data);
  }

  // child component call
  dimensionCharts(data) {
    this.initStatChartData(true, data);
  }

  cancelDimension() {
    this.isShowdimensionUv = false;
    this.ngOnInit();
  }

 /**
  * 获取试验分组下，指标详情报表数据
  */
  getMetricsResult(callback){
    const d = new Date(this.endTime);
    if (this.by === this.hour && this.selectedTime) {
      d.setDate(d.getDate() + 1);
    }
    this.apiData.getStatResultByParam(this.exp.id, this.startTime, d, this.curSelectStat, this.by).then(res => {
      return callback(res);
    })
  }

  /**
   * 获取试验分组下，指标详情列表数据
   */
   getMetricsTableResult(callback){
     this.apiData.getTableResultByParam(this.exp.id, this.startTime, this.endTime, this.curSelectStat, this.by).then(res => {
       return callback(res);
     })
   }

}

