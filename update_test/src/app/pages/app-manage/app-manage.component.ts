import { Component, OnInit } from '@angular/core';
import { App, AppType, APP_TYPE_H5, APP_TYPE_ANDROID, APP_TYPE_IOS, APP_TYPE_WX, APP_TYPE_LPO, User, UserInfo, APP_TYPE_DEF } from '../../model';
import { ApiAuth, ApiExperiment } from 'adhoc-api';
import { AuthService } from '../../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CurAppService } from '../../service/cur-app.service';
import { Modal } from 'ngx-modialog/plugins/vex';
import { Experiment, VersionStatus } from '../../model';
import { AuthGuard } from '../../system/auth-guard.service';

import { TranslateService } from '@ngx-translate/core';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-app-manage',
  templateUrl: './app-manage.component.html',
  styleUrls: ['./app-manage.component.scss']
})
export class AppManageComponent implements OnInit {
  myApps: Array<App>;
  apps: Array<App>;
  curUser: User;
  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_WX = APP_TYPE_WX;
  APP_TYPE_LPO = APP_TYPE_LPO;
  APP_TYPE_DEF = APP_TYPE_DEF;
  versionStatus = VersionStatus;

  isLoading = true;

  constructor(private apiAuth: ApiAuth,
    private apiExp: ApiExperiment,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private curApp: CurAppService,
    private translate: TranslateService,
    public modal: Modal
  ) {
  }

  async getAllApps(userid: string) {
    let apps = await this.apiAuth.getAllApp();

    const d = apps as Array<App>;
    this.myApps = d.filter(app => app.author_id === userid);
    this.apps = d.filter(app => app.author_id !== userid);
    this.isLoading = false;

  }

  async ngOnInit() {
    this.curApp.cleanApp();
    const userEmail = await this.authService.getUser();
    let userinfo = await this.apiAuth.getUserInfo(userEmail)

    this.getAllApps((userinfo as UserInfo).id);

  }

  async delApp(app: App) {
    const index = this.apps.findIndex(item => item.id === app.id);
    const myindex = this.myApps.findIndex(item => item.id === app.id);

    let res = await this.apiAuth.deleteAppById(app.id)

    if (index > -1) {
      this.apps.splice(index, 1);
    } else if (myindex > -1) {
      this.myApps.splice(myindex, 1);
    }

  }

  async delConfirm(e, App) {
    const deleteText = this.translate.get('confirmDelete', { key: App.name });
    const canDelText = this.translate.get('canDelText');
    const modalOk = this.translate.get('modal.ok');
    const modalCancel = this.translate.get('modal.cancel');
    const translateModal = forkJoin(deleteText, modalOk, modalCancel);

    const canDel = await this.getExperiments(App.id);

    if (!canDel) {
      const canNotDleModal = forkJoin(canDelText, modalOk, modalCancel);
      canNotDleModal.subscribe(res => {

        this.modal.confirm()
          .message(res[0])
          .okBtn(res[1])
          .cancelBtn(res[2])
          .showCloseButton(true)
          .open()
      });
      return
    }

    translateModal.subscribe(result => {

      this.modal.confirm()
        .message(result[0])
        .okBtn(result[1])
        .cancelBtn(result[2])
        .showCloseButton(true)
        .open()
        .then(resultPromise => {
          return resultPromise.result.then(r => {
            this.delApp(App);
          }, err => {

          });
        });
    });

  }

  async getExperiments(appid) {
    const exps = await this.apiExp.getAllExperiments(appid)
    const expAry = exps as Experiment[];
    var result

    if (expAry.length == 0) {
      result = true;
    } else {
      result = expAry.every(item => (item.status != this.versionStatus.Run))

    }

    return result
  }

  selectApp(app: App) {
    if (app.typ === AppType.LPO) {
      this.curApp.setCookie(app.id);
      this.curApp.goLPO();
      return;
    }
    this.curApp.setApp(app);
    this.router.navigate(['/']);
  }


  async selectDemoApp() {
    let res = await this.apiAuth.getAppById('ac66bf61-7608-4a5f-9bc4-9e7cf0f9694f')

    const app = res as App;
    this.selectApp(app);

  }

}

export const AppManageRouter = {
  path: 'app_manage',
  canActivate: [AuthGuard],
  component: AppManageComponent
};
