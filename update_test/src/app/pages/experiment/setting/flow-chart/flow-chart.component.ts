import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Experiment } from '../../../../model/experiment';
import { Version , VersionStatus as vs } from '../../../../model/version';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

import { Layer, App } from '../../../../model';

import { color } from '../../data/echarts.component';

import { ApiExperiment } from 'adhoc-api';
import { CurAppService } from '../../../../service/cur-app.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-flow-chart',
  templateUrl: './flow-chart.component.html',
  styleUrls: ['./flow-chart.component.scss']
})
export class FlowChartComponent implements OnInit, OnDestroy {
  @Input() exp$: Subject<Experiment>;
  version: Array<Version>;
  subscription: ISubscription;
  curExp: Experiment;
  appid: string;
  layers: Array<Layer>;
  exps: Array<Experiment>;

  pieData: Object;

  constructor(private apiExp: ApiExperiment,
    private curApp: CurAppService) {
      if(this.curApp.getApp()){
        this.appid = this.curApp.getApp().id;
      }
      
  }

  ngOnInit() {
    this.subscription = this.exp$.subscribe(exp => {
      this.curExp = exp;
      this.version = (exp as Experiment).getVersions().sort(this.sortVersionsByName);

        this.apiExp.getLayersByAppId(this.appid).then(lists => {
          this.layers = lists;

          this.apiExp.getAllExperiments(this.appid).then(experiments => {
            this.exps = experiments as Array<Experiment>;
            this.pieOptionOfLayer();
          });

        });
    });
  }

  sortVersionsByName(a, b) {
    if ( a.created_at + a.last_modified !== b.created_at + b.last_modified) {
      return (a.created_at + a.last_modified) - (b.created_at + b.last_modified);
    }
    try {
      const aIndex = a.name.indexOf('_');
      const bIndex = b.name.indexOf('_');
      return a.name.slice(0, aIndex).split('版本')[1] - b.name.slice(0, bIndex).split('版本')[1];
    } catch (err) {
      console.log('名字规则不正确');
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  pieOptionOfLayer() {
    const config = this.pieConfig();
    let elseTraffic = 100;
    // 添加当前试验每个版本的流量
    config.title.text = this.getLayerById(this.curExp.layer_id).name;
    this.version.forEach(v => {
      const index = this.version.indexOf(v);
      config.series[0].data.push({ value: v.traffic, name: index === 0 ? v.name : `版本${ index }`});
      elseTraffic -= v.traffic;
    });
    // 添加同层下面其他试验的流量
    const sameLayerExperiments = this.exps.filter(exp => {
      return exp.layer_id === this.curExp.layer_id && exp.id !== this.curExp.id && exp.traffic > 0;
    });
    sameLayerExperiments.forEach(exp => {
      config.series[0].data.push({ value: exp.traffic, name: exp.name});
      elseTraffic -= exp.traffic;
    });
    // 层下面的剩余流量
    if (elseTraffic > 0) {
      const elseName = '剩余流量';
      config.legend.data.push(elseName);
      config.series[0].data.push({
        value: elseTraffic,
        name: elseName ,
        itemStyle: {
          normal: { color: '#eee' },
          emphasis: { color: '#eee' }
        }
      });
    }
    this.pieData = config;
  }

 pieConfig() {
  return  {
        color: color,
        title : {
           text: '某站点用户访问来源',
           bottom: 0,
           left: 'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
            position: ['50%', '50%']
        },
        legend: {
            orient: 'vertical',
            align: 'left',
            top: 'bottom',
            show: false,
            data: []
        },
        series : [
            {
                name: '当前层',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data: [],
                label: {
                  normal: {
                    show: false
                  }
                }
            }
        ]
    };
  }

  getLayerById(layerid) {
    const result = this.layers.find(layer => layer.id === layerid);
    return result ? result : { name: '默认层'};
  }

}
