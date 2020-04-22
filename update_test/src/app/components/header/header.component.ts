import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiExperiment } from 'adhoc-api';
import { Experiment, App, APP_TYPE_H5, APP_TYPE_ANDROID, APP_TYPE_IOS, APP_TYPE_LPO, APP_TYPE_WX, VersionStatus } from '../../model';
import { CurAppService } from '../../service/cur-app.service';
import { ApiAuth } from 'adhoc-api';
import { AbLangService } from '../../service/ab-lang.service';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() expid;
  showList: string;
  exp: Experiment;
  app: App;
  curApp$: Subject<App>;
  curExp$: Subject<Experiment>;
  iconType: string;

  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_LPO = APP_TYPE_LPO;
  APP_TYPE_WX = APP_TYPE_WX;

  vss = VersionStatus;
  isHasNotify = false;

  constructor(private apiExp: ApiExperiment,
    private curApp: CurAppService,
    private curLang: AbLangService,
    private translate: TranslateService,
    private apiAuth: ApiAuth) {
    this.curApp$ = new Subject<App>();
    this.curExp$ = this.curApp.$curExp;
    this.curApp$.subscribe(app => this.app = app);
    this.curExp$.subscribe(exp => this.exp = exp);
  }


  async ngOnInit() {
    this.apiExp.getExpById(this.expid).then(exp => this.exp = exp as Experiment);
    this.app = this.curApp.getApp();
    const res = await this.apiAuth.getNotify();

    res['length'] > 0 ? this.isHasNotify = true : this.isHasNotify = false;

    // 识别当前的语言
    let currentLang = this.curLang.getLang();
    this.iconType = currentLang === 'zh' ? 'icon-EN' : 'icon-ZN';

  }

  show(typ) {
    this.showList = typ;
  }

  close(value) {
    if (!value) {
      this.showList = '';
    }
  }

  changeLanguage(event) {
    this.iconType = this.curLang.changeLang();
  }

  translateNum(translateKey, num) {
    return this.translate.get(translateKey, { day: num });
  }

  disappear(val) {

    if (!val) {
      this.isHasNotify = false
    }
  }

}
