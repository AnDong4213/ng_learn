import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ApiAuth } from 'adhoc-api';
import { UserInfo } from '../../model';
import { AuthGuard } from '../../system/auth-guard.service';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  ui: UserInfo;
  isFree = false;
  isPay = false;
  isExpire = false;

  lastPay;
  lastApi;
  curMaxApi;

  constructor(private authService: AuthService,
    private translate: TranslateService,
    private authApi: ApiAuth) { }


  async ngOnInit() {
    const email = this.authService.getUserEmail();
    const txt = await this.translate.get('account.unlimited');
    const res = await this.authApi.getUserInfo(email);

    this.ui = res as UserInfo;
    const statusResult = await this.authApi.getUserStatus(this.ui['id']);
    const userStatus = statusResult && statusResult['result'] ? statusResult['result'] : {};

    this.isFree = userStatus['status'] === 'free';
    this.isPay = userStatus['status'] === 'pay';
    this.isExpire = userStatus['status'] === 'unpay';

    this.lastPay = this.ui.getPayLastDate();
    this.lastApi = this.ui.getLastUsed();

    if (this.ui.getCurPay()) {
      this.curMaxApi = this.ui.getCurPay()['num'] >= Math.pow(10, 15) - 1 ? txt : this.ui.getCurPay()['num'];
    }

  }


  isFreeWarning() {
    return this.ui.isFree() && this.ui.getFreeDay() < 7 && !this.ui.isNextDayPay();
  }

  isPayWarning() {
    return this.ui.isPay() && this.ui.getPayDay() < 15;
  }

  isApiWarning() {
    return this.ui.isPay() && this.ui.getApiUsedRate() > 0.8;
  }

  isApiNone() {
    return this.ui.isPay() && this.ui.getApiUsedRate() > 1;
  }

}
export const AccountRouter = {
  path: 'account',
  component: AccountComponent,
  canActivate: [AuthGuard]
};
