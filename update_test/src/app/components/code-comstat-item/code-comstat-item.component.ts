import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { App, APP_TYPE_H5, Stat, Experiment, VersionStatus } from '../../model';
import { ApiData } from 'adhoc-api';
import { CurAppService } from '../../service/cur-app.service';
import { FormulaValidator } from '../../utils/validators/formal-stat';
import { AbLodash } from '../../service/ab-lodash.service';
import { FlagNamelValidator, CheckRepeatValidator } from '../../utils/validators';
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
import { Subject } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: '[app-code-comstat-item]',
  templateUrl: './code-comstat-item.component.html',
  styleUrls: ['./code-comstat-item.component.scss']
})
export class CodeComstatItemComponent implements OnInit {

  app: App;
  @Input() stat: Stat;
  @Input() stats: Array<Stat>;
  @Input() comStat: Array<Stat>;
  @Output() del$: EventEmitter<Stat> = new EventEmitter<Stat>();
  @Output() save$: EventEmitter<Stat> = new EventEmitter<Stat>();
  statForm: FormGroup;
  comStatForm: FormGroup;
  descForm: FormGroup;
  @Input() exp: Experiment;
  versionStatus = VersionStatus;
  @Input() validStat: Array<Stat>;
  indexStat: Object;
  $comStatAutoComplete: Subject<string[]>;
  comStatsNames: Array<string>;

  nameFocus = false;
  comstatFocus = false;
  descFocus = false;
  ifExistComStat = false;

  isEdit = true;

  constructor(private fb: FormBuilder,
    curApp: CurAppService,
    private _: AbLodash,
    private apiData: ApiData,
    private translate: TranslateService,
    public modal: Modal) {
    this.app = curApp.getApp();
    this.comStatsNames = new Array<string>();
    this.$comStatAutoComplete = new Subject<string[]>();
  }

  comStatAutoFilter(val) {

    return this.comStatsNames.filter(i => i.indexOf(val) > -1);
  }

  ngOnInit() {

    this.indexStat = this._.groupBy(this.validStat, 'name');
    const comStatNames = this.stats.reduce((names: Array<string>, comstat) => {
      names.push(comstat.name);
      return names;
    }, []);

    this.statForm = this.fb.group({
      name: [this.stat.name,
      Validators.compose([
        Validators.required,
        Validators.maxLength(20),
        FlagNamelValidator(),
        CheckRepeatValidator(comStatNames)
      ])
      ]
    });

    this.descForm = this.fb.group({
      desc: [this.stat.description]
    });

    this.comStatForm = this.fb.group({
      formula: [
        this.stat.formula,
        FormulaValidator(this.app, this.indexStat, APP_TYPE_H5)
      ]
    });

    this.comStatsNames = this.comStat.reduce((names: Array<string>, item: Stat) => {
      names.push(item.name);
      return names;
    }, []);

    this.statForm.controls.name.valueChanges.subscribe(val => {

      let afterFilters = this.comStatAutoFilter(val);
      this.$comStatAutoComplete.next(afterFilters);

      let comStatDes = this.comStat.find(s => {
        return s.name === val
      });

      if (comStatDes) {
        this.ifExistComStat = true;
        this.stat.description = comStatDes.description.trim();
        this.stat.formula = this.comStat.find(s => s.name === val).formula.trim();
        this.descForm.controls['desc'].disable({ onlySelf: true });
        this.comStatForm.controls['formula'].disable({ onlySelf: true });
      } else {
        this.ifExistComStat = false;
        this.descForm.controls['desc'].reset();
        this.descForm.controls['desc'].enable({ onlySelf: true });
        this.comStatForm.controls['formula'].reset();
        this.comStatForm.controls['formula'].enable({ onlySelf: true });
      }

    });
  }

  submit() {
    if (this.statForm.invalid) {
      if (!this.statForm.controls.name.value) {
        // this.del$.emit(this.stat);
      }
      return false;
    }
    if (this.comStatForm.invalid) {
      this.comstatFocus = true;
      return false;
    }
    this.stat.isNew = false;
    this.stat.name = this.statForm.controls.name.value;
    this.stat.description = this.stat.description;
    if (this.stat.description) {
      this.stat.description.trim();
    }
    this.stat.formula = this.comStatForm.controls.formula.value.trim();


    this.save$.emit(this.stat);
  }

  upDesc() {
    this.stat.isEdit = false;
    this.apiData.updateStat(this.app.id, this.stat).then(res => { });
  }

  edit() {
    this.stat.isEdit = true;
  }

  delItem() {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'comstat.del'], { name: this.stat.name });
    this.modal.confirm()
      .message(dic['comstat.del'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
          this.del$.emit(this.stat);
        }, err => {

        });
      });

  }

  descOut() {
  }

  checkValid(form) {
    const result = false;
    [{ name: 'name', focus: this.nameFocus, form: this.statForm },
    { name: 'formula', focus: this.comstatFocus, form: this.comStatForm },
    { name: 'desc', focus: this.descFocus, form: this.descForm }]
      .map(item => {
        if (item.form['controls'][item.name].valid) {
          item.focus = false;
        } else {
          item.focus = true;
        }
      });
    return result;
  }

  focus(form) {
    this.isEdit = true;
  }

  descEdit() {
    if (this.stat.isNew) {
      return;
    }
    this.stat.isNew = false;
    this.stat.isEdit = false;
    this.stat.description = this.stat.description.trim();
    this.apiData.updateStat(this.app.id, this.stat).then(res => { });
  }

  selectComStat(value) {
    this.stat.description = this.comStat.find(s => s.name === value.option.value).description.trim();
    this.stat.formula = this.comStat.find(s => s.name === value.option.value).formula.trim();

  }

}
