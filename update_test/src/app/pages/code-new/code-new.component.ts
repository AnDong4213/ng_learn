import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Experiment, App, AppType, Layer, Version, VersionTyp, VersionStatus, UserInfo } from '../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiExperiment } from 'adhoc-api';
import { CurAppService } from '../../service/cur-app.service';
import { AuthGuard } from '../../system/auth-guard.service';
import { AbKeystatService } from '../../service/ab-keystat.service';
import { ToastrService } from 'ngx-toastr';

import { Subject } from 'rxjs';

import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExpNamelValidator, FlagNamelValidator, FlagLayerValidator, CheckRepeatValidator } from '../../utils/validators';
import { RoleService } from '../../service/role.service';
import { Role } from '../../model/role';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-code-new',
  templateUrl: './code-new.component.html',
  styleUrls: ['./code-new.component.scss']
})
export class CodeNewComponent implements OnInit {

  userinfo: UserInfo;
  stepOneForm: FormGroup;
  stepSecondForm: FormGroup;
  stepThirdForm: FormGroup;
  stepsubmit = false;
  exp: Experiment;
  exp$: Subject<Experiment>;
  app: App;
  layers$;
  layers: Array<Layer>;
  layerItems: Array<Object>;
  activeLayer = { id: '', text: '' };
  flags: Array<Object>;
  flagNames: Array<string>;

  $autoComplete: Subject<string[]>;

  appType = AppType;
  expNames = [];
  exps: Array<Experiment> = [];
  othesflags = Array<any>();
  isErrorFlags = false;
  layerRole: Array<any>;

  stepIndex;

  selected = 'string';
  isAdvFlag = true;
  isSelectExistFlag = false;

  creatLock = false;

  constructor(private fb: FormBuilder,
    private apiExp: ApiExperiment,
    private toastr: ToastrService,
    private roleService: RoleService,
    private abKeyStat: AbKeystatService,
    private route: Router,
    private translate: TranslateService,
    private curApp: CurAppService) {
    this.app = this.curApp.getApp();
    this.exp = new Experiment();
    this.exp$ = new Subject<Experiment>();
    this.exp$.subscribe(exp => this.exp = exp);

    this.$autoComplete = new Subject<string[]>();
    this.layerRole = [Role.layer];
  }

  ngOnInit() {
    this.apiExp.getAllExperiments(this.app.id).then(exps => {
      this.exps = exps as Experiment[];

    });

    this.initFormGroups();

    this.roleService.checkRole(Role.flagtyp).then(isrole => {

      this.isAdvFlag = isrole;
      this.initFormGroups();
    });

    this.apiExp.getAllExpNames(this.app.id).then(res => {
      this.expNames = res as Array<any>;
      this.initFormGroups();
    });
    const app = this.curApp.getApp();


    this.layers$ = this.apiExp.getLayersByAppId(this.app.id)
      .then(layers => {
        if (!layers) {
          layers = new Array<Layer>();
        }
        const defaultLayer = new Layer({
          name: '默认层',
          id: 'default'
        });
        const newLayer = new Layer({
          name: '新建层',
          id: 'new'
        });
        layers.unshift(defaultLayer);
        layers.push(newLayer);

        return layers;
      })


    this.layers$.then(arr => {
      this.layers = arr;
      this.apiExp.getLayerTraffic(this.app.id).then(res => {
        this.layerItems = res.reduce((sum, l: Layer) => {
          sum.push({ id: l.id, text: l.name + ` (可用流量${l.traffic}%)` });
          return sum;
        }, []);
        this.activeLayer = Object.assign(this.layerItems[0]);
        this.stepOneForm.controls['layer_id'].setValue(this.layerItems[0]['id']);
      });
    });

    this.apiExp.getFlags(this.app.id).then(res => {
      this.flags = res;
      const filterFlags = this.flags
        .filter(f => {
          if (this.isAdvFlag) {
            return !f['name'].startsWith('_');
          } else {
            return !f['name'].startsWith('_') && typeof (f['default_value']) === 'number';
          }
        });
      const filterFlagNames = filterFlags.reduce((names: Array<string>, item) => {
        names.push(item['name']);
        return names;
      }, new Array<string>());
      this.flagNames = filterFlagNames as Array<string>;
      this.$autoComplete.next(this.flagNames);
    });

    this.abKeyStat.setKeyStat(undefined);
  }

  flagAutoFilter(val) {
    return (this.flagNames || []).filter(i => i.indexOf(val) > -1);
  }

  initFormGroups() {
    let objOneForm = {
      name: [this.exp.name,
      Validators.compose([
        Validators.required,
        ExpNamelValidator(),
        Validators.maxLength(25),
        CheckRepeatValidator(this.expNames)
      ])
      ],
      description: [''],
      layer_id: [''],
      flagname: ['',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
          FlagNamelValidator(),
          FlagLayerValidator(this.exp, this.exps)
        ])
      ]
    }

    if (this.isAdvFlag) {
      objOneForm['flagvalue'] = [
        '',
        Validators.compose([
          Validators.required,
        ])
      ]
    }

    this.stepOneForm = this.fb.group(objOneForm);

    let lastChangeValues;
    this.stepOneForm.valueChanges.subscribe(values => {
      if (!lastChangeValues) {
        lastChangeValues = values;
        this.flagNameChange(values['flagname']);
      } else if (lastChangeValues['flagname'] !== values['flagname']) {
        lastChangeValues = values;
        this.flagNameChange(values['flagname']);
      } else {
        return;
      }

    });

    this.stepSecondForm = this.fb.group({});

    this.stepThirdForm = this.fb.group({});


    this.stepOneForm.controls.flagname.valueChanges.subscribe(val => {
      this.$autoComplete.next(this.flagAutoFilter(val));
    });
  }

  stepOneSubmit(form) {
    this.stepsubmit = true;
    if (!form.valid) {
      return false;
    }
    const dic = this.translate.instant(['codenew.originversion', 'codenew.version']);
    const values = this.stepOneForm.getRawValue();
    const flag = {};
    if (this.isAdvFlag) {
      flag[values['flagname']] = values['flagvalue'];
    } else {
      flag[values['flagname']] = 0;
    }
    const controlVersion = new Version({
      isControl: true,
      name: dic['codenew.originversion'] + '_' + values['name'],
      description: values['description'].trim(),
      flags: flag,
      typ: VersionTyp.EXP_TYPE_CODE
    });

    const flagv = Object.assign({}, flag);
    if (this.isAdvFlag) {
      flagv[values['flagname']] = values['flagvalue'];
    } else {
      flagv[values['flagname']] = 1;
    }
    const experimentVersion = new Version({
      name: dic['codenew.version'] + '1_' + values['name'],
      flags: flagv,
      typ: VersionTyp.EXP_TYPE_CODE
    });
    this.exp.control = controlVersion;
    this.exp.experiments = new Array<Version>();
    this.exp.experiments.push(experimentVersion);
    this.exp.name = values['name'];
    this.exp.description = values['description'].trim();
    this.exp.app_id = this.app.id;
    this.exp.typ = VersionTyp.EXP_TYPE_CODE;
    this.exp$.next(this.exp);
    return true;
  }

  stepTwoSubmit(e) {
    e.stopPropagation();
    this.exp$.next(this.exp);
  }


  complete() {
    if (this.creatLock) {
      return;
    }
    this.creatLock = true;
    const flagKey = Object.keys(this.exp.control.flags)[0];
    const flagVal = this.exp.control.flags[flagKey];
    // init flag value
    //this.exp.experiments.map((v, i) => {
    //v.flags[flagKey] = i + 1;
    //});
    // init layer

    const layerResult = this.layers.find(l => l['id'] === this.stepOneForm.value['layer_id']);
    const flagResult = this.flags.find(f => f['name'] === flagKey);
    const flagObj = flagResult ? flagResult : {
      name: flagKey,
      description: '',
      typ: 0,
      default_value: flagVal
    };

    this.asyncExp(layerResult, flagObj, (res) => {
      if (res && res.hasOwnProperty('error_code')) {
        this.route.navigate(['/new', 'code']);
      } else {
        this.route.navigate(['/exp', res.id, 'setting']);
      }
    });
  }

  generateLayerName(index: number = 1) {
    const layerName = `layer${index}`;
    const rindex = this.layers.findIndex(layer => layer.name === layerName);
    if (rindex > -1) {
      index++;
      return this.generateLayerName(index);
    } else {
      return layerName;
    }
  }

  asyncLayer(layer) {
    let ob;
    if (layer['id'] === 'new') {
      const layerobj = Object.assign({}, layer);
      layerobj.name = this.generateLayerName();
      ob = this.apiExp.createLayer(this.app.id, layerobj);
    } else {
      ob = Observable.create(serve => {
        serve.next(layer);
        serve.complete();
      }).toPromise();
    }
    return ob;
  }

  asyncFlag(flag) {
    let ob;
    if (flag['id']) {
      ob = this.apiExp.updateFlag(this.app.id, encodeURIComponent(flag['name']), flag);
    } else {
      ob = this.apiExp.createFlag(this.app.id, flag);
    }
    return ob;
  }

  asyncExp(layerOpts, flagOpts, callback) {

    const ob = Promise.all([this.asyncLayer(layerOpts), this.asyncFlag(flagOpts)]);
    ob.then(res => {
      const layer = res[0];
      const flag = res[1];
      if (layer['id'] !== 'default') {
        this.exp.setLayerId(layer['id']);
      }
      this.apiExp.createExp(this.app.id, this.exp).then(exp => {
        if (exp.hasOwnProperty('error_code')) {
          this.toastr.error(exp['reason_display']);
          return;
        }
        this.exp$.next(new Experiment(exp));
        return callback(exp);
      });
    });
  }

  switchLayer(layer) {
    this.activeLayer = layer;
    this.stepOneForm.controls['layer_id'].setValue(layer.id);
    this.getFlags();
    this.resetFlag();
  }

  resetFlag() {
    if (this.stepOneForm.controls['flagname']) {
      this.stepOneForm.controls['flagname'].reset();
    }
    if (this.stepOneForm.controls['flagvalue']) {
      this.stepOneForm.controls['flagvalue'].reset();
      this.stepOneForm.controls['flagvalue'].enable({ onlySelf: true });
    }
    this.isSelectExistFlag = false;
  }

  // 验证当前变量是否存在其它层运行状态的试验中
  getFlags() {
    if (this.stepOneForm.value.layer_id && this.stepOneForm.value.flagname) {
      this.othesflags = [];
      const layerId = this.stepOneForm.value.layer_id;
      let othesLayerExps = Array<any>();
      if (layerId === 'default') {
        othesLayerExps = this.exps.filter(e => e.layer_id && e.typ === VersionTyp.EXP_TYPE_CODE && e.status === VersionStatus.Run);
      } else {
        othesLayerExps = this.exps.filter(e =>
          (!e.layer_id || e.layer_id !== layerId) && e.typ === VersionTyp.EXP_TYPE_CODE && e.status === VersionStatus.Run);
      }
      othesLayerExps.forEach(e => {
        this.othesflags.push(...Object.keys(e.control.flags));
      });
      this.othesflags.includes(this.stepOneForm.value.flagname) ? this.isErrorFlags = true : this.isErrorFlags = false;
    }
  }


  getFlagTyp(val) {
    const flag = this.flags.find(item => item['name'] === val);
    const t = typeof (flag['default_value']);
    return t;
  }

  flagNameChange(e) {
    if (!e) {
      return;
    }
    const flag = this.flags.find(item => item['name'] === e);

    if (flag) {
      this.isSelectExistFlag = true;
      const typ = typeof (flag['default_value']);
      this.selected = typ;
      if (this.stepOneForm.controls['flagvalue']) {
        this.stepOneForm.controls['flagvalue'].setValue(flag['default_value']);
        this.stepOneForm.controls['flagvalue'].disable({ onlySelf: true });
      }

    } else {
      this.isSelectExistFlag = false;
      if (this.stepOneForm.controls['flagvalue']) {

        this.stepOneForm.controls['flagvalue'].reset();
        this.stepOneForm.controls['flagvalue'].enable({ onlySelf: true });
      }

    }
  }

}

export const CodeNewRouter = {
  path: 'new/code',
  canActivate: [AuthGuard],
  component: CodeNewComponent
};
