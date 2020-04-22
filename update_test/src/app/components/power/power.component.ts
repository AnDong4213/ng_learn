import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Version, PV_STAT_NAME, Experiment } from '../../model';
import { AbLodash } from '../../service/ab-lodash.service';
import { DataBase, STAT_TYPE_MEAN, STAT_TYPE_UV_MEAN } from '../../pages/experiment/data/base.component';

import { ApiExperiment, ApiData } from 'adhoc-api';
import { ABService } from '../../service/ab.service';
import { CurAppService } from '../../service/cur-app.service';

@Component({
  selector: 'app-power',
  templateUrl: './power.component.html',
  styleUrls: ['./power.component.scss']
})
export class PowerComponent extends DataBase implements OnInit {
  @Input() versions: Array<Version>;
  @Input() exp: Experiment;
  @Input() indexStat: Object;
  @Input() indexClientStat: Object;
  @Input() allTableDatas;
  @Input() v: Version;
  @Input() statName;
  @Input() statType;
  @Output() isClose = new EventEmitter<boolean>();


  indexPvSum: Object;
  curStat: Object;

  opts = {
    mda: 3,
    aplha: 5,
    confidence_level: 95
  };

  power;

  //变更后的报表数据
  mergeData;

  distributionData = {
    grid: {
      show: false,
      left: '5%',
      right: '2%',
      bottom: '7%'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (datas) => {
        const showData = [];
        let out = '';
        if (datas instanceof Array) {
          datas.forEach(function(d) {
            let showTipData = '异常数据';
            if (d.seriesName !== 'H0' && d.seriesName !== 'H1') {
              return;
            }
            if (d.data instanceof Array) {
              showTipData = d.data[1];
            }

            let data;
            if (d.data !== '-') {
              data = d.seriesName + ':' + showTipData + '<br/>';
              showData.push(data);
            } else {
              data = d.seriesName + ':' + 0 + '<br/>';
              showData.push(data);
            }
          });
        } else {
          out = datas.seriesName + ':' + this.opts.mda + '%';
          if (datas.seriesName && datas.seriesName.startsWith('-')) {
            out = datas.seriesName + ':-' + this.opts.mda + '%';
          }
        }
        showData.forEach(ks => out += ks);
        return out;
      }
    },
    xAxis: {
      type: 'value',
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      max: 0.5,
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#d2d2d2',
          width: 1
        }
      },
      splitLine: {
        show: false,
      }
    },
    legend: { right: 10, data: [{ name: '统计功效', icon: 'roundRect' }, { name: '置信区间', icon: 'triangle' }] },
  };

  constructor(route: ActivatedRoute,
    apiData: ApiData,
    _: AbLodash,
    ab: ABService,
    curAppService: CurAppService,
    apiExp: ApiExperiment) {
    super(route, apiData, _, ab, curAppService, apiExp);
  }

  ngOnInit() {

    this.indexClientResult = this.indexClientStat;
    this.indexStatResult = this.indexStat;
    this.control = this.exp.control;

    this.initPower();
  }

  close() {
    this.isClose.emit(false);
  }


  ok() {
    this.isClose.emit(false);
  }

  getItemVariance(v) {
    const num = this.curStat[v.id] ? this.curStat[v.id].variance : 0;
    if (num < 0) {
      return 0;
    }
    return Math.sqrt(num);
  }

  // 统计分布图 start。
  staticEchart(power) {

    const staticSeries = [];
    const delta = power.z_effect;
    const direction = Math.sign(power.zvalue);
    const mean = direction * Math.abs(delta);
    const step = 0.2;

    /* 画 H0 和 H1 分布图 */
    this.versions.forEach(exp => {
      const series_nd_data = { data: {} };
      const serie = {
        name: '',
        data: [],
        smooth: true,
        type: 'line',
        lineStyle: { normal: { color: exp.isControl ? '#4183cd' : '#58c584', width: 1 } },
        symbol: 'none'
      };
      serie.name = exp.isControl ? 'H0' : 'H1';
      const m = exp.isControl ? 0 : mean;

      for (let z = m - 4; z < m + 4; z += step) {
        const fx = this.normalDistribution(z, m, 1);
        serie.data.push([z, fx]);
      }

      staticSeries.push(serie);
    });

    // 坐标轴1
    const serie = {
      name: '',
      data: [[power.z_min, 0], [power.z_min, 0.5]],
      smooth: false,
      type: 'line',
      z: 0,
      symbol: 'none',
      lineStyle: { normal: { color: '#58c584', type: 'dashed', width: 1 } }
    };
    staticSeries.push(serie);

    // 坐标轴2
    const seriea = {
      name: '',
      data: [[power.z_max, 0], [power.z_max, 0.5]],
      smooth: false,
      type: 'line',
      symbol: 'none',
      lineStyle: { normal: { color: '#58c584', type: 'dashed', width: 1 } }
    };
    staticSeries.push(seriea);

    /* 画最小重要变化标志线 */
    const serieb = {
      name: '-δ',
      data: [[-power.z_detect, 0], [-power.z_detect, 0.5]],
      smooth: false,
      type: 'line',
      symbol: 'none',
      lineStyle: { normal: { color: '#d2d2d2', type: 'dashed', width: 1 } },
      z: 0,
      markPoint: {
        label: {
          normal: {
            show: true, formatter: function(params) {

              return serieb.name
            }
          }        
},
        symbolSize: 40,
        data: [{
          coord: [-power.z_detect, 0.5],
          itemStyle: { normal: { color: '#aaa' } }
        }]
      }
    };

    staticSeries.push(serieb);

    const seriec = {
      name: 'δ',
      data: [[power.z_detect, 0], [power.z_detect, 0.5]],
      smooth: false, type: 'line', symbol: 'none',
      lineStyle: { normal: { color: '#d2d2d2', type: 'dashed', width: 1 } },
      z: 0,
      markPoint: {
        label: {
          show: true, formatter: function(params) {

            return seriec.name
          }
        },
        symbolSize: 40,
        data: [{
          coord: [power.z_detect, 0.5],
          itemStyle: { normal: { color: '#aaa' } }
        }]
      }
    };
    staticSeries.push(seriec);


    /* 画 alpha 竖线 */
    const z_alpha = Math.sign(power.zvalue) * power.z_alpha;
    const f_alpha = this.normalDistribution(z_alpha, 0, 1);
    const seried = {
      name: '',
      data: [[z_alpha, 0], [z_alpha, f_alpha]],
      smooth: false,
      type: 'line',
      symbol: 'none',
      lineStyle: { normal: { color: '#d2d2d2', width: 1 } }
    };
    staticSeries.push(seried);

    /* 画统计功效面积 */
    const seriee = {
      name: '统计功效',
      data: [],
      smooth: true,
      type: 'line',
      symbol: 'none',
      lineStyle: { normal: { opacity: 0 } },
      areaStyle: { normal: {} },
      itemStyle: { normal: { color: '#EEF9F2' } }
    };
    const min_z = direction > 0 ? z_alpha : mean - 4;
    const max_z = direction > 0 ? mean + 4 : z_alpha;
    let z = min_z;
    while (z < max_z) {
      const fx = this.normalDistribution(z, mean, 1);
      serie.data.push([z, fx]);

      // if (z >= max_z) break;
      z += step;
      if (z > max_z) {
        z = max_z;
      }
    }

    staticSeries.push(seriee);

    /* 画置信区间横线 */
    const serief = {
      name: '置信区间',
      data: [
        { name: (power.ci_low || 0).toPrecision(3) + '%', value: [power.z_min, 0.45], symbol: 'triangle', symbolSize: 10 },
        { name: (power.variant || 0).toPrecision(3) + '%', value: [power.zvalue, 0.45], symbol: 'circle', symbolSize: 8 },
        { name: (power.ci_high || 0).toPrecision(3) + '%', value: [power.z_max, 0.45], symbol: 'triangle', symbolSize: 10 }],
      smooth: false,
      type: 'line',
      hoverAnimation: false,
      itemStyle: { normal: { color: '#58c584' } },
      lineStyle: { normal: { color: '#58c584', type: 'dotted' } },
      z: 3,
      label: { normal: { show: true, position: [10, -10], formatter: '{b}' } }
    };
    staticSeries.push(serief);
    this.distributionData['series'] = staticSeries;
    this.mergeData = {
      series: staticSeries
    };
  }

  changeAplha() {
    const num = this.opts.aplha;
    if (num < 0 || num > 100) {
      return;
    }
    //修改置信区间值
    this.opts.confidence_level = Math.round(100 - num);
    this.initPower();
  }

  changeMda() {
    const num = this.opts.mda;
    if (num < 0 || num > 100) {
      return;
    }
    this.initPower();
  }


  initPower() {
    this.power = this.getOutputPowerCi(this.statName, this.v.id, this.opts.mda / 100, this.opts.aplha / 100, this.statType);

    this.power['variant'] = (this.power['ci_low'] + this.power['ci_high']) / 2;
    this.power['significance_desc'] = this.power['pvalue'] < this.opts.aplha / 100 ? '统计显著' : '非统计显著';

    this.staticEchart(this.power);

  }

}
