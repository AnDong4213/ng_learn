import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Stat, Experiment, VersionTyp, VersionStatus } from '../../../model/index';

@Component({
  selector: 'app-statinfo-list',
  templateUrl: './statinfo-list.component.html',
  styleUrls: ['./statinfo-list.component.scss']
})
export class StatinfoListComponent implements OnInit {

  @Input() stats;
  @Input() layers;
  @Input() allexp;

  expData: Array<Object>;
  newstatAry: Array<Stat>;
  statExpAry: Array<Experiment>;
  allstat: Array<Stat>;

  EXP_TYPE_CODE = VersionTyp.EXP_TYPE_CODE;
  VersionStatus = VersionStatus.Run;
  ifShowIndex;
  showToggle: Boolean = false;

  constructor(
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
    window.addEventListener('click', e => {
      this.ifShowIndex = -1;
      this.showToggle = false;
    });

    this.statTable();
  }


  showAllExp(e, index) {
    e.stopPropagation();
    this.ifShowIndex = index;
    this.showToggle = !this.showToggle;
  }

  // 进入单项指标和复合指标中渲染
  statTable() {
    this.expData = new Array();
    let expstat = new Array();
    this.newstatAry = new Array();

    // 得到运行中的所有试验的指标
    this.statExpAry = this.allexp.filter(exp => {
      if (exp.status === this.VersionStatus) {
        expstat = expstat.concat(exp.control.stats)
      }
      return exp.status === this.VersionStatus
    })

    // 当前运行中的指标数组去重
    expstat.filter((stat, index) => {
      if (this.newstatAry.indexOf(stat) == -1) {
        this.newstatAry.push(stat)
      }
    })

    this.allstat = this.stats.filter(item => item.formula === "");

    // 得到所有指标的相关试验
    let explistAry = new Array();
    this.statExpAry.map(exp => {
      const l = this.layers.find(layer => layer.id === exp.layer_id);
      exp.control.stats.map(stat => {
        let statObj = {
          statname: stat,
          expname: exp.name,
          layer: l ? l.name : this.translate.instant('explist.默认层'),
          traffic: exp.traffic
        }
        explistAry.push(statObj)
      })
    })

    // 分别获取单项指标数据和复合指标的数据
    this.statTabData(this.allstat, explistAry)


  }
  // 显示指标数据
  statTabData(allstat, statExp) {
    this.newstatAry.map(item => {
      const i = allstat.filter(stat => stat['name'] === item)[0];
      const o = statExp.filter(exp => exp.statname === item);

      if (i) {
        this.expData.push({
          name: i['name'],
          discribe: i['description'],
          formula: i['formula'] || '',
          explist: o
        })
      }

    })

  }

}
