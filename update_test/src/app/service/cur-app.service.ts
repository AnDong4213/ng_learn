import { Injectable } from '@angular/core';
import { App, Experiment, AppType } from '../model';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { environment } from '../../environments/environment';
import { CookieService } from '../system/cookie.service';

import { Subject } from 'rxjs';

const CUR_APP_KEY = 'U_CUR_APP_ID';

@Injectable()
export class CurAppService {
  router: Router;
  $curApp: Subject<App> = new Subject<App>();
  $curExp: Subject<Experiment> = new Subject<Experiment>();

  expireDay: number = 3;
  appCookieName = 'ADHOC_MEMBERSHIP_APPID_KEY';

  constructor(router: Router,
    private cookie: CookieService) {
    this.router = router;
  }

  setApp(app: App) {
    this.setCookie(app.id);
    localStorage.setItem(CUR_APP_KEY, JSON.stringify(app));
    this.$curApp.next(app);
  }

  getApp(): App {
    const json = localStorage.getItem(CUR_APP_KEY);
    if (!json) {
      return null;
    }
    const app = new App(JSON.parse(localStorage.getItem(CUR_APP_KEY)));
    this.setCookie(app.id);
    return app;
  }

  cleanApp() {
    localStorage.removeItem(CUR_APP_KEY);
    this.clearCookie();
  }

  isExist(): boolean {
    return localStorage.getItem(CUR_APP_KEY) ? true : false;
  }

  getApp$() {
    return this.$curApp;
  }

  setCookie(appid) {
    this.cookie.setCookie(this.appCookieName, appid);
  }

  clearCookie() {
    this.cookie.delete(this.appCookieName);
  }

  goLPO() {
    window.location.href = environment.lpo_url;
  }
}
