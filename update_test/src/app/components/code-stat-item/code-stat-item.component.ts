import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Stat, App, VersionStatus, Experiment, AppType, VersionTyp, APP_TYPE_ANDROID, APP_TYPE_IOS } from '../../model';
import { ApiData, ApiExperiment, ApiH5 } from 'adhoc-api';
import { CurAppService } from '../../service/cur-app.service';
import { FlagNamelValidator, CheckRepeatValidator } from '../../utils/validators';
import { ABService } from '../../service/ab.service';
import { TokenService } from '../../service/token.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import {
  VEXBuiltInThemes,
  Modal,
  DialogPreset,
  DialogFormModal,
  DialogPresetBuilder,
  VEXModalContext,
  vexV3Mode,
  providers
} from 'ngx-modialog/plugins/vex';

@Component({
  selector: '[app-code-stat-item]',
  templateUrl: './code-stat-item.component.html',
  styleUrls: ['./code-stat-item.component.scss']
})
export class CodeStatItemComponent implements OnInit {
  app: App;
  @Input() stat: Stat;
  @Input() curStats: Array<Stat>;
  @Input() thisKeyStat: Stat;
  @Output() setNewStat: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Input() thisKeyStatName: string;
  @Input() thisNum;
  @Input() comStats: Array<Stat>;
  @Output() del$: EventEmitter<Stat> = new EventEmitter<Stat>();
  @Output() save$: EventEmitter<Stat> = new EventEmitter<Stat>();
  @Output() saveKeyStat$: EventEmitter<string> = new EventEmitter<string>();
  statForm: FormGroup;
  @Input() exp: Experiment;
  versionStatus = VersionStatus;
  ifThisStat: Boolean = false;
  @Input() exp$: Subject<Experiment>;
  @Input() curComStats: Array<Stat>;
  @Input() appStats: Array<Stat>;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_IOS = APP_TYPE_IOS;

  $statAutoComplete: Subject<string[]>;
  statsNames: Array<string>;

  constructor(private fb: FormBuilder,
    curApp: CurAppService,
    private apiData: ApiData,
    public modal: Modal,
    private apiExp: ApiExperiment,
    private apih5: ApiH5,
    private ab: ABService,
    private token: TokenService,
    private router: Router,
    private translate: TranslateService,
    private toastrService: ToastrService) {
    this.app = curApp.getApp();

    this.statsNames = new Array<string>();
    this.$statAutoComplete = new Subject<string[]>();
  }

  statAutoFilter(val) {
    return this.statsNames.filter(i => i.indexOf(val) > -1);
  }

  ngOnInit() {
    const comStatsNames = this.comStats.reduce((names: Array<string>, item: Stat) => {
      names.push(item.name);
      return names;
    }, []);

    this.statForm = this.fb.group({
      name: [this.stat.name,
      Validators.compose([
        Validators.required,
        Validators.maxLength(100),
        FlagNamelValidator(),
        CheckRepeatValidator(comStatsNames)
      ])
      ]
    });

    this.statsNames = this.appStats.reduce((names: Array<string>, item: Stat) => {
      names.push(item.name);
      return names;
    }, []);

    this.statForm.controls.name.valueChanges.subscribe(val => {

      // 当输入是空 或者 输入之后全部删除时 下拉框提示内容页为空
      if (this.statForm.controls.name.value === '') {
        this.$statAutoComplete.next([]);
      } else {
        this.$statAutoComplete.next(this.statAutoFilter(val));
      }

    });

  }

  submit(form) {
    if (!form.valid) {
      // this.del$.emit(this.stat);
      return false;
    }
    this.stat.name = form.controls.name.value;

    this.stat.isNew = false;
    this.upDesc();

    this.save$.emit(this.stat);
    if (this.thisKeyStat === undefined) {

      this.saveKeyStat$.emit(this.stat.name);
      this.thisKeyStat = this.stat;
      this.thisKeyStatName = this.stat.name;

    }

  }

  upDesc() {
    this.stat.isEdit = false;
    this.stat.description = this.stat.description.trim();
    this.apiData.updateStat(this.app.id, this.stat);
  }

  selectStat(value) {
    this.stat.description = this.appStats.find(s => s.name === value.option.value).description.trim();
  }

  completeName(form) {
    if (!form.controls.name.value && this.stat.isNew) {
      this.del$.emit(this.stat);
      return false;
    }
    const stat = this.appStats.find(s => s.name === form.controls.name.value);
    stat ? this.stat.description = stat.description.trim() : this.stat.description = '';
  }

  edit() {
    this.stat.isEdit = true;
  }

  del() {
    const txt = this.translate.instant('codestat.p7');
    this.checkStats() ? this.toastrService.error(txt) : this.del$.emit(this.stat);
  }

  // 验证复合指标中是否存在当前优化指标
  checkStats() {
    let arrayStat = [];
    this.curComStats.forEach(s => {
      const items = s.formula.replace(/[\(\)\+\-\*\/]{1,}/g, '`').split('`');
      arrayStat = items.concat(arrayStat);
    });
    arrayStat = arrayStat.map(i => i.trim());
    return arrayStat.includes(this.stat.name);
  }

  delConfirm(stat) {
    if (this.exp.is_ai && stat.name === this.exp.ai_stat_key) {
      return this.delAiConfirm(stat);
    }

    if (stat) {
      const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'codestat.del'], { name: stat.name });
      this.modal.confirm()
        .message(dic['codestat.del'])
        .cancelBtn(dic['modal.cancel'])
        .okBtn(dic['modal.ok'])
        .showCloseButton(true)
        .open()
        .then(resultPromise => {
          return resultPromise.result.then(r => {
            this.del();
          }, err => {

          });
        });
    } else {
      this.del();
    }
  }

  delAiConfirm(stat) {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'codestat.aidel'], { name: stat.name });
    this.modal.confirm()
      .message(dic['codestat.aidel'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
        }, err => {
        });
      });
  }

  goEdit() {
    if (this.checkStats()) {
      const txt = this.translate.instant('codestat.p7')
      return this.toastrService.error(txt)
    }

    if (this.app.typ === AppType.H5 && (this.exp.typ === VersionTyp.EXP_TYPE_BUILD || this.exp.typ === VersionTyp.EXP_TYPE_URL)) {
      this.goH5EditAddStat();
    }

    if (this.app.typ === AppType.ANDROID) {
      this.router.navigate(['/', 'edit', 'android']);
    }


    if (this.app.typ === AppType.IOS) {
      this.router.navigate(['/', 'edit', 'ios']);
    }
  }

  async updateH5Data() {
    const res = await this.apiExp.getExpById(this.exp.id)
    this.exp$.next(new Experiment(res as Experiment));

  }

  goH5EditAddStat() {
    const urldata = JSON.parse(this.exp.control.annotation['urls'])[0].url;
    const tab = window.open('about:blank', '_blank');
    const url = encodeURIComponent(urldata);
    const redirectURL = this.apih5.openSdk({
      url: url,
      authkey: this.token.getToken(),
      appid: this.app.id,
      groupid: this.exp.id,
      expid: this.exp.control.id,
      appkey: this.app.app_key
    });
    const self = this;
    this.ab.binWindowClose(tab, () => {
      self.updateH5Data();
    });
    tab.location.href = redirectURL;
  }

  selectKeyStat(statname) {

    if (statname === this.thisKeyStatName) {
      return
    }
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'codestat.confimDic'], { name: this.stat.name });
    this.modal.confirm()
      .message(dic['codestat.confimDic'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
          //判断是否在创建时选择关键指标
          if (!statname) { // 该指标还没有创建成功
            this.setNewStat.emit(true);
          } else { // 指标已经创建成功
            this.saveKeyStat$.emit(this.stat.name);
            this.setNewStat.emit(false);
          }

        }).catch(err => {

          this.save$.emit(this.thisKeyStat)

        });
      }).catch(err => { });



  }

}
