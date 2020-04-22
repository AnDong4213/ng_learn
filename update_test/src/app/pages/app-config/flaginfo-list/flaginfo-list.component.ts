import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Stat, Experiment, Layer, VersionTyp, VersionStatus } from '../../../model/index';

@Component({
  selector: 'app-flaginfo-list',
  templateUrl: './flaginfo-list.component.html',
  styleUrls: ['./flaginfo-list.component.scss']
})
export class FlaginfoListComponent implements OnInit {

  @Input() stats;
  @Input() layers;
  @Input() allexp;

  expData: Array<Object>;
  listData: Array<Object>;
  flagExpAry: Array<Experiment>;

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

    this.flagTab();
  }


  showAllExp(e, index) {
    e.stopPropagation();
    this.ifShowIndex = index;
    this.showToggle = !this.showToggle;
  }

  // 进入flag页面中渲染
  flagTab() {

    this.expData = new Array();
    this.listData = new Array();

    // 筛选出实运行中的编程试验
    this.flagExpAry = this.allexp.filter(exp => {
      return exp.typ === this.EXP_TYPE_CODE && exp.status === this.VersionStatus
    })

    /**
     * 遍历编程试验，找出flag和使用flag的试验
     */
    let flags = new Array();
    let fileterflags = new Array();
    let fileterflagsAry = new Array();
    this.flagExpAry.map(exp => {
      flags.push(exp.control.flags)
    });

    flags.map(flag => {
      if (fileterflags.indexOf(Object.keys(flag)[0]) == -1) {
        fileterflags.push(Object.keys(flag)[0]);
        fileterflagsAry.push(flag);
      }
    })
    this.flagExpAry.map(exp => {
      const l = this.layers.find(layer => layer.id === exp.layer_id);

      let layerObj = {
        thisFlag: Object.keys(exp.control.flags)[0],
        expname: exp.name,
        layer: l ? l.name : this.translate.instant('explist.默认层'),
        traffic: exp.control.traffic
      }
      this.listData.push(layerObj)
    })

    fileterflagsAry.map(flag => {

      const o = this.listData.filter(obj => obj['thisFlag'] === Object.keys(flag)[0]);
      let flagObj = {
        name: Object.keys(flag)[0],
        defaultVal: Object.values(flag)[0],
        type: typeof (Object.values(flag)[0]),
        explist: o
      }

      this.expData.push(flagObj)
    })


  }

}
