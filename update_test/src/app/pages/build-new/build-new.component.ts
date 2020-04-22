import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiExperiment, ApiH5 } from 'adhoc-api';
import { CurAppService } from '../../service/cur-app.service';
import { Version, VersionTyp, VersionStatus, App, Layer, AppType, Experiment } from '../../model';
import { ABService } from '../../service/ab.service';
import { CurExpService } from '../../service/cur-exp.service';
import { TokenService } from '../../service/token.service';
import { AbKeystatService } from '../../service/ab-keystat.service';
import { AuthGuard } from '../../system/auth-guard.service';
import { URLValidator, URLRepeatValidator, RegExpRepeatValidator } from '../../utils/validators/url';

import {
  ExpNamelValidator, CheckRepeatValidator, URLMatchRepeatValidator,
  RegexpMatchRepeatValidator,
  jsRegexpMatchRepeatValidator,
  jsRegexpMatchURLValidator
} from '../../utils/validators';

import { Subject } from 'rxjs';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../../model/role';
import { RoleService } from '../../service/role.service';
import { TranslateService } from '@ngx-translate/core';
import { equalSegments } from '@angular/router/src/url_tree';

@Component({
  selector: 'app-build-new',
  templateUrl: './build-new.component.html',
  styleUrls: ['./build-new.component.scss']
})
export class BuildNewComponent implements OnInit {

  stepOneForm: FormGroup;
  stepSecondForm: FormGroup;
  stepThirdForm: FormGroup; stepsubmit = false;
  exp: Experiment;
  exps: Array<Experiment> = new Array;
  exp$: Subject<Experiment>;
  app: App;
  layers$;
  layers: Array<Layer>;
  layerItems: Array<Object>;
  activeLayer = { id: '', text: '' };
  flags: Array<Object>;

  urlMode: Array<Object> = [{ id: 1, text: '完全匹配', mode: 'equal' },
  { id: 2, text: '模糊匹配', mode: 'regex' }];
  activeURLMode;
  isRegexpMode = false;

  appType = AppType;
  VersionTyp = VersionTyp;
  VersionStatus = VersionStatus;
  expNames = [];
  layerRole: Array<any>;

  isErrorFlags: Boolean = false;
  otheslayers = Array<any>();
  formGroups: Object;

  allURLMatch: Array<Experiment> = new Array<Experiment>();

  constructor(private fb: FormBuilder,
    private ab: ABService,
    private curApp: CurAppService,
    private apih5: ApiH5,
    private route: Router,
    private abKeyStat: AbKeystatService,
    private curExp: CurExpService,
    private token: TokenService,
    private translate: TranslateService,
    private roleService: RoleService,
    private apiExp: ApiExperiment) {

    this.activeURLMode = [Object.assign({}, this.urlMode[0])];

    this.exp = new Experiment();
    this.exp$ = new Subject<Experiment>();
    this.exp$.subscribe(exp => this.exp = exp);

    this.layers = new Array<Layer>();

    this.layerRole = [Role.layer];
  }

  ngOnInit() {
    this.app = this.curApp.getApp();
    this.initFormGroups();

    this.roleService.checkRole(Role.regexp_match).then(isRegexpRole => {
      if (!isRegexpRole) {
        return;
      }
      // 正则匹配为高级功能需要权限开通
      this.urlMode.push({
        id: 3,
        text: '正则匹配',
        mode: 'jsregexp'
      });
      this.urlMode = [].concat(this.urlMode);
    });


    // 准备数据用于后续URL重复判断
    this.apiExp.getAllExperiments(this.app.id).then(res => {
      this.exps = res;
      this.allURLMatch = this.exps.filter(exp =>
        (exp.status === VersionStatus.Run || exp.status === VersionStatus.Default) &&
        (exp.typ === VersionTyp.EXP_TYPE_BUILD || exp.typ === VersionTyp.EXP_TYPE_URL) &&
        this.app.typ === AppType.H5);

      this.apiExp.getAllExpNames(this.app.id).then(ress => {
        this.expNames = ress as Array<any>;
        this.initFormGroups();
      });
    });


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
      });

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
    });
    this.abKeyStat.setKeyStat(undefined);

  }

  initFormGroups() {
    this.formGroups = {
      name: ['',
        Validators.compose([
          Validators.required,
          ExpNamelValidator(),
          Validators.maxLength(25),
          CheckRepeatValidator(this.expNames)
        ])
      ],
      description: [''],
      layer_id: [''],
    }

    if (this.app.typ === AppType.H5) {
      this.formGroups['url'] = ['',
        Validators.compose([
          Validators.required,
          URLValidator(),
          // URLMatchRepeatValidator(this.allURLMatch)
        ])
      ];
    }
    this.stepOneForm = this.fb.group(this.formGroups);
    this.stepSecondForm = this.fb.group({});
    this.stepThirdForm = this.fb.group({});
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

  stepOneAndroid(form) {
    const values = form.value;
    const fkey = `__visualexperiment__`;
    const fval = '{}';

    const layerResult = this.layers.find(l => l['id'] === values['layer_id']);
    const flagResult = this.flags.find(f => f['name'] === fkey);
    const flagObj = flagResult ? flagResult : {
      name: fkey,
      description: '',
      typ: 0,
      default_value: fval
    };

    const dic = this.translate.instant(['codenew.originversion', 'codenew.version']);
    const flag = {};
    flag[fkey] = fval;
    const controlVersion = new Version({
      isControl: true,
      name: dic['codenew.originversion'] + '_' + values['name'],
      description: values['description'].trim(),
      flags: flag,
      typ: VersionTyp.EXP_TYPE_BUILD
    });

    const experimentVersion = new Version({
      name: dic['codenew.version'] + '1_' + values['name'],
      flags: Object.assign({}, flag),
      typ: VersionTyp.EXP_TYPE_BUILD
    });
    this.exp.control = controlVersion;
    this.exp.experiments = new Array<Version>();
    this.exp.experiments.push(experimentVersion);
    this.exp.name = values['name'];
    this.exp.description = values['description'].trim();
    this.exp.app_id = this.app.id;
    this.exp.typ = VersionTyp.EXP_TYPE_BUILD;

    this.asyncExp(layerResult, flagObj, () => {
      this.curExp.setCurExp(this.exp);
      this.route.navigate(['/', 'edit', 'android']);
    });
    return false;
  }

  stepOneiOS(form) {
    const values = form.value;
    const fkey = `__visualexperiment__`;
    const fval = '{}';

    const layerResult = this.layers.find(l => l['id'] === values['layer_id']);
    const flagResult = this.flags.find(f => f['name'] === fkey);
    const flagObj = flagResult ? flagResult : {
      name: fkey,
      description: '',
      typ: 0,
      default_value: fval
    };

    const dic = this.translate.instant(['codenew.originversion', 'codenew.version']);
    const flag = {};
    flag[fkey] = fval;
    const controlVersion = new Version({
      isControl: true,
      name: dic['codenew.originversion'] + '_' + values['name'],
      description: values['description'].trim(),
      flags: flag,
      typ: VersionTyp.EXP_TYPE_BUILD
    });

    const experimentVersion = new Version({
      name: dic['codenew.version'] + '1_' + values['name'],
      flags: Object.assign({}, flag),
      typ: VersionTyp.EXP_TYPE_BUILD
    });
    this.exp.control = controlVersion;
    this.exp.experiments = new Array<Version>();
    this.exp.experiments.push(experimentVersion);
    this.exp.name = values['name'];
    this.exp.description = values['description'].trim();
    this.exp.app_id = this.app.id;
    this.exp.typ = VersionTyp.EXP_TYPE_BUILD;

    this.asyncExp(layerResult, flagObj, () => {
      this.curExp.setCurExp(this.exp);
      this.route.navigate(['/', 'edit', 'ios']);
    });
    return false;
  }

  stepOneH5(form) {
    const values = form.value;
    const fkey = `_${encodeURIComponent(values['url'])}_`;
    let regexpVal = '';
    if (values['regexp']) {
      regexpVal = values['regexp'].replace(/^\s+|\s+$/g, '');
    }
    if (values['jsregexp']) {
      regexpVal = values['jsregexp'].replace(/^\s+|\s+$/g, '');
    }
    const fitem = {
      url: values['url'].replace(/\s+/g, ''),
      mode: this.activeURLMode[0].mode,
      regexp: regexpVal || ''
    };
    const fval = this.getFlagJSON(fitem);

    const layerResult = this.layers.find(l => l['id'] === values['layer_id']);
    const flagResult = this.flags.find(f => f['name'] === fkey);
    const flagObj = flagResult ? flagResult : {
      name: fkey,
      description: '',
      typ: 0,
      default_value: fval
    };

    const dic = this.translate.instant(['codenew.originversion', 'codenew.version']);
    const flag = {};
    flag[fkey] = fval;
    const controlVersion = new Version({
      isControl: true,
      name: dic['codenew.originversion'] + '_' + values['name'],
      description: values['description'].trim(),
      flags: flag,
      typ: VersionTyp.EXP_TYPE_BUILD,
      annotation: {
        urls: JSON.stringify([fitem])
      }
    });

    const experimentVersion = new Version({
      name: dic['codenew.version'] + '1_' + values['name'],
      flags: Object.assign({}, flag),
      typ: VersionTyp.EXP_TYPE_BUILD,
      annotation: {
        urls: JSON.stringify([fitem])
      }
    });
    this.exp.control = controlVersion;
    this.exp.experiments = new Array<Version>();
    this.exp.experiments.push(experimentVersion);
    this.exp.name = values['name'];
    this.exp.description = values['description'].trim();
    this.exp.app_id = this.app.id;
    this.exp.typ = VersionTyp.EXP_TYPE_BUILD;
    // this.exp.setAvgTraffic();

    const tab = window.open('about:blank', '_blank');
    this.asyncExp(layerResult, flagObj, () => {
      this.snapshot(encodeURIComponent(values['url']));
      this.goH5Edit({ url: encodeURIComponent(values['url']) }, tab);
    });
    return true;
  }

  stepOneSubmit(form) {
    this.stepsubmit = true;
    if (!form.valid) {
      return false;
    }
    if (this.exp['id']) {
      this.exp$.next(this.exp);
      return;
    }
    if (this.app.typ === AppType.ANDROID) {
      return this.stepOneAndroid(form);
    }
    if (this.app.typ === AppType.IOS) {
      return this.stepOneiOS(form);
    }
    if (this.app.typ === AppType.H5) {
      return this.stepOneH5(form);
    }
  }


  switchURLMode(selected) {
    console.log(this.allURLMatch);
    this.activeURLMode = [selected];
    if (selected.text === '完全匹配') {
      this.activeURLMode[0].mode = 'equal';
    }
    if (selected.text === '模糊匹配') {
      this.activeURLMode[0].mode = 'regex';
    }
    if (selected.text === '正则匹配') {
      this.activeURLMode[0].mode = 'jsregexp';
    }

    const activeMode = this.activeURLMode[0];
    this.stepOneForm.removeControl('regexp');
    this.stepOneForm.removeControl('jsregexp');
    if (activeMode.text === '模糊匹配') {
      this.stepOneForm.addControl('regexp', new FormControl('', Validators.compose([
        Validators.required,
        /*
         *RegexpMatchRepeatValidator(this.allURLMatch),
         */
        jsRegexpMatchURLValidator('regexp')
      ])));
    }
    if (activeMode.text === '正则匹配') {
      this.stepOneForm.addControl('jsregexp', new FormControl('', Validators.compose([
        Validators.required,
        /*
         *jsRegexpMatchRepeatValidator(this.allURLMatch),
         */
        jsRegexpMatchURLValidator('')
      ])));
    }
  }

  switchLayer(layer) {
    this.activeLayer = layer;
    this.stepOneForm.controls['layer_id'].setValue(layer.id);
  }

  getH5FlagTmpl(url) {
    return {
      mode: url.mode,
      regexp: url.regexp,
      url: url.url,
      data: {
        changes: [],
        stats: []
      }
    };
  }

  getFlagJSON(url) {
    const data = {};
    const itemData = this.getH5FlagTmpl(url);
    data[url.url] = itemData;
    return JSON.stringify(data);
  }


  async updateH5Data() {
    const res = await this.apiExp.getExpById(this.exp.id);
    this.exp$.next(res as Experiment);
  }


  goH5Edit(url, tabWindowId) {
    const redirectURL = this.apih5.openSdk({
      url: url.url,
      authkey: this.token.getToken(),
      appid: this.app.id,
      groupid: this.exp.id,
      expid: this.exp.control.id,
      appkey: this.app.app_key
    });

    this.ab.binWindowClose(tabWindowId, () => {
      this.updateH5Data();
    });

    tabWindowId.location.href = redirectURL;
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

  asyncLayer(layer) {
    let ob;
    if (layer && layer['id'] === 'new') {
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

  asyncExp(layerOpts, flagOpts, callback) {
    const ob = Promise.all([this.asyncLayer(layerOpts), this.asyncFlag(flagOpts)]);
    ob.then(res => {
      const layer = res[0];
      const flag = res[1];
      if (layer && layer['id'] !== 'default') {
        this.exp.setLayerId(layer['id']);
      }
      this.apiExp.createExp(this.app.id, this.exp).then(exp => {
        if (exp.hasOwnProperty('error_code')) {
          return;
        }
        this.exp$.next(new Experiment(exp));
        return callback();
      });
    });
  }


  snapshot(url) {
    const vss = this.exp.getVersions();
    vss.map(v => {
      this.apih5.verSnapshot({
        url: url,
        name: v.id,
        type: 'web'
      }).then(res => { console.log(res); });
    });
  }

  complete() {
    this.route.navigate(['/exp', this.exp.id, 'setting']);
  }

  changeUrl() {
    if (this.stepOneForm.controls.hasOwnProperty('jsregexp')) {
      this.stepOneForm.controls['jsregexp'].reset();
    }
    if (this.stepOneForm.controls.hasOwnProperty('regex')) {
      this.stepOneForm.controls['regex'].reset();
    }
  }


}

export const BuildNewRouter = {
  path: 'new/build',
  canActivate: [AuthGuard],
  component: BuildNewComponent
};
