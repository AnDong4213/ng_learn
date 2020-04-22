import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { ApiAuth } from 'adhoc-api';
import { UserInfo } from '../../model';

@Component({
  selector: 'app-charge-status-bar',
  templateUrl: './charge-status-bar.component.html',
  styleUrls: ['./charge-status-bar.component.scss']
})
export class ChargeStatusBarComponent implements OnInit {
  @Input() isChargeLang;
  ui: UserInfo;

  isShow = false;
  textMsg = '';


  constructor(private authService: AuthService,
    private authApi: ApiAuth) { }

  async ngOnInit() {
    const email = this.authService.getUserEmail();
    const res = await this.authApi.getUserInfo(email)

    this.ui = res as UserInfo;
    if (!this.ui) {
      return;
    }
    const statusResult = await this.authApi.getUserStatus(this.ui['id']);
    const userStatus = statusResult && statusResult['result'] ? statusResult['result'] : {};

    if (userStatus['status'] === 'free' && userStatus['days'] < 7) {
      this.isShow = true;
      this.textMsg = `您的免费试用期仅剩${userStatus['days']}天，请联系客户经理续费。点击查看账户详情`;
    }

    if (userStatus['status'] === 'pay' && userStatus['days'] < 15) {
      this.isShow = true;
      this.textMsg = `您的使用期限仅剩${userStatus['days']}天，请及时与客户经理联系。点击查看账户详情`;
    }

    if (userStatus['status'] === 'unpay') {
      this.isShow = true;
      this.textMsg = `您的账户已到期，平台已停止数据统计。点击查看账户详情`;
    }

    if (userStatus['status'] === 'pay' && this.ui.getApiUsedRate() > 0.8) {
      this.isShow = true;
      this.textMsg = `您的api用量即将超出上限，请及时与客户经理联系。点击查看账户详情`;
    }

    if (userStatus['status'] === 'pay' && this.ui.getApiUsedRate() > 1) {
      this.isShow = true;
      this.textMsg = `您的api用量已经超出上限，平台已停止数据统计。点击查看账户详情`;
    }

  }

}
