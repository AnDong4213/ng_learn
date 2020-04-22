import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CurAppService } from '../../service/cur-app.service';
import { AbKeystatService } from '../../service/ab-keystat.service';
import { Version, VersionTyp, VersionStatus, App, Layer, AppType, Experiment } from '../../model';
import { ApiExperiment, ApiH5 } from 'adhoc-api';
import { Subject } from 'rxjs';
import { Observable, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { URLValidator } from '../../utils/validators/url';

import { ToastrService } from 'ngx-toastr';

import {
  ExpNamelValidator, CheckRepeatValidator, URLMatchRepeatValidator,
  RegexpMatchRepeatValidator,
  jsRegexpMatchRepeatValidator,
  jsRegexpMatchURLValidator
} from '../../utils/validators';

import { Role } from '../../model/role';
import { RoleService } from '../../service/role.service';
import { TranslateService } from '@ngx-translate/core';

import { map } from 'rxjs/operators';

@Component({
  selector: 'app-url-new',
  templateUrl: './url-new.component.html',
  styleUrls: ['./url-new.component.scss']
})
export class UrlNewComponent implements OnInit {

  stepOneForm: FormGroup;
  stepSecondForm: FormGroup;
  stepThirdForm: FormGroup;
  exp$: Subject<Experiment>;
  exp: Experiment;
  stepsubmit = false;
  curApp: App;
  layers: Array<Layer>;
  layers$;
  layerItems: Array<Object>;
  activeLayer = { id: '', text: '' };
  flags: Array<Object>;


  urlMode: Array<Object> = [{ id: 1, text: '完全匹配', mode: 'equal' }, { id: 2, text: '模糊匹配', mode: 'regex' }];
  activeURLMode;
  appType = AppType;
  expNames = [];
  layerRole: Array<any>;

  reqLock = false;

  exps: Array<Experiment> = new Array<Experiment>();

  allURLMatch: Array<Experiment> = new Array<Experiment>();

  test = false;

  stepOneLock = new EventEmitter();

  constructor(private fb: FormBuilder,
    private curAppService: CurAppService,
    private apiExp: ApiExperiment,
    private translate: TranslateService,
    private toast: ToastrService,
    private abKeyStat: AbKeystatService,
    private roleService: RoleService,
    private route: Router) {
    this.layers = new Array<Layer>();
    this.activeURLMode = [Object.assign({}, this.urlMode[0])];
    this.exp = new Experiment();
    this.exp$ = new Subject<Experiment>();
    this.exp$.subscribe(exp => this.exp = exp);
    this.layerRole = [Role.layer];

  }


  ngOnInit() {
    this.initFormGroups();
    this.curApp = this.curAppService.getApp();
    this.getAllLayers();
    this.setLayer();
    this.apiExp.getFlags(this.curApp.id).then(res => {
      this.flags = res;
    });

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
    this.apiExp.getAllExperiments(this.curApp.id).then(res => {
      this.exps = res;
      this.allURLMatch = this.exps.filter(exp =>
        (exp.status === VersionStatus.Run || exp.status === VersionStatus.Default) &&
        (exp.typ === VersionTyp.EXP_TYPE_BUILD || exp.typ === VersionTyp.EXP_TYPE_URL) &&
        this.curApp.typ === AppType.H5);

      this.apiExp.getAllExpNames(this.curApp.id).then(ress => {
        this.expNames = ress as Array<any>;
        this.initFormGroups();
      });
    });

    this.abKeyStat.setKeyStat(undefined);
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

  stepOneSubmit(form) {
    this.stepsubmit = true;
    if (!form.valid) {
      return false;
    }

    if (this.exp['id']) {
      this.exp$.next(this.exp);
      return;
    }

    const values = form.value;
    const furl = values['url'].trim();
    let fregexp = '';
    if (values['regexp']) {
      fregexp = values['regexp'].replace(/\s+/g, '');
    }
    if (values['jsregexp']) {
      fregexp = values['jsregexp'].replace(/\s+/g, '');
    }
    const fkey = `_${encodeURIComponent(furl)}_`;
    const fitem = {
      url: furl.replace(/\s/g, ''),
      mode: this.activeURLMode[0].mode,
      regexp: fregexp || ''
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
    const dic = this.translate.instant(['codenew.originversion', 'codenew.version', 'codenew.origindesc']);
    const flag = {};
    flag[fkey] = fval;
    const controlVersion = new Version({
      isControl: true,
      name: dic['codenew.originversion'] + '_' + values['name'],
      description: dic['codenew.origindesc'].trim(),
      flags: flag,
      typ: VersionTyp.EXP_TYPE_URL,
      annotation: {
        base_url: furl.replace(/\s+/g, ''),
        urls: JSON.stringify([fitem])
      }
    });

    const experimentVersion = new Version({
      name: dic['codenew.version'] + '1_' + values['name'],
      flags: Object.assign({}, flag),
      typ: VersionTyp.EXP_TYPE_URL,
      annotation: {
        base_url: '',
        urls: JSON.stringify([fitem])
      },
      isEdit: true
    });
    this.exp.control = controlVersion;
    this.exp.experiments = new Array<Version>();
    this.exp.experiments.push(experimentVersion);
    this.exp.name = values['name'];
    this.exp.description = values['description'].trim();
    this.exp.app_id = this.curApp.id;
    this.exp.typ = VersionTyp.EXP_TYPE_URL;

    // 避免网络造成用户快速重复提交问题
    if (this.reqLock) {
      return;
    }
    this.reqLock = true;
    this.asyncExp(layerResult, flagObj, () => {
      this.reqLock = false;
      this.stepOneLock.emit(true);
    });
  }

  asyncFlag(flag) {
    let ob;
    if (flag['id']) {
      ob = this.apiExp.updateFlag(this.curApp.id, encodeURIComponent(flag['name']), flag);
    } else {
      ob = this.apiExp.createFlag(this.curApp.id, flag);
    }
    return ob;
  }

  asyncLayer(layer) {
    let ob;
    if (layer && layer['id'] === 'new') {
      const layerobj = Object.assign({}, layer);
      layerobj.name = this.generateLayerName();
      ob = this.apiExp.createLayer(this.curApp.id, layerobj);
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
      this.apiExp.createExp(this.curApp.id, this.exp).then(exp => {
        if (exp.hasOwnProperty('error_code')) {
          this.toast.error(exp['reason_display']);
          return;
        }
        exp['experiments'][0].isEdit = true;
        this.exp$.next(new Experiment(exp));
        return callback();
      });
    });
  }

  getH5FlagTmpl(url) {
    return {
      mode: url.mode,
      regexp: url.regexp,
      url: url.url,
      data: {
        newPageUrl: '',
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

  switchURLMode(selected) {
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

  // 获取当前app的所有layers
  getAllLayers() {
    const defaultLayer = new Layer({
      name: '默认层',
      id: 'default'
    });
    const newLayer = new Layer({
      name: '新建层',
      id: 'new'
    });
    if (!this.curApp) {
      const l = new Array<Layer>();
      l.push(defaultLayer);
      l.push(newLayer);
      return l;
    }
    this.layers$ = this.apiExp.getLayersByAppId(this.curApp.id)
      .then(layers => {
        if (!layers) {
          layers = new Array<Layer>();
        }
        layers.unshift(defaultLayer);
        layers.push(newLayer);
        return layers;
      });
  }

  setLayer() {
    this.layers$.then(arr => {
      this.layers = arr;
      this.apiExp.getLayerTraffic(this.curApp.id).then(res => {
        this.layerItems = res.reduce((sum, l: Layer) => {
          sum.push({ id: l.id, text: l.name + ` (可用流量${l.traffic}%)` });
          return sum;
        }, []);
        this.activeLayer = Object.assign(this.layerItems[0]);
        this.stepOneForm.controls['layer_id'].setValue(this.layerItems[0]['id']);
      })
    });
  }



  switchLayer(layer) {
    this.activeLayer = layer;
    this.stepOneForm.controls['layer_id'].setValue(layer.id);
  }

  initFormGroups() {
    this.stepOneForm = this.fb.group({
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
      url: ['',
        Validators.compose([
          Validators.required,
          URLValidator(),
          // URLMatchRepeatValidator(this.allURLMatch)
        ])
      ]
    });

    this.stepSecondForm = this.fb.group({});

    this.stepThirdForm = this.fb.group({});

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

export const UrlNewRouter = {
  path: 'new/url',
  component: UrlNewComponent
};
