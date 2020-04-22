import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";
import {
  App,
  APP_TYPE_H5,
  APP_TYPE_ANDROID,
  APP_TYPE_IOS,
  APP_TYPE_LPO,
  APP_TYPE_DEF,
  APP_TYPE_WX,
} from "../../model";
import { CurAppService } from "../../service/cur-app.service";
import { AbLangService } from "../../service/ab-lang.service";
import { Router } from "@angular/router";
import { AuthService } from "../../service/auth.service";
import { ApiAuth } from "adhoc-api";
import { UserInfo } from "../../model";
import { Subject } from "rxjs";
import { BindMobileModalComponent } from "../bind-mobile-modal/bind-mobile-modal.component";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  userInfo: UserInfo;
  email: string;
  showList: string;
  app: App;
  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_LPO = APP_TYPE_LPO;
  APP_TYPE_WX = APP_TYPE_WX;
  APP_TYPE_DEF = APP_TYPE_DEF;
  isHasNotify = false;
  iconType: string;
  curApp$: Subject<App>;

  constructor(
    private curApp: CurAppService,
    private curLang: AbLangService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private authService: AuthService,
    private apiAuth: ApiAuth,
    private router: Router
  ) {
    this.curApp$ = new Subject<App>();
    this.curApp$.subscribe((app) => (this.app = app));
  }

  async ngOnInit() {
    this.app = this.curApp.getApp();
    const res = await this.apiAuth.getNotify();

    res.length > 0 ? (this.isHasNotify = true) : (this.isHasNotify = false);

    // 识别当前的语言
    let currentLang = this.curLang.getLang();
    this.iconType = currentLang === "zh" ? "icon-EN" : "icon-ZN";

    this.email = this.authService.getUserEmail();
    const userInfo = await this.apiAuth.getUserInfo(this.email);
    this.userInfo = userInfo as UserInfo;

    // 非主账号 未绑定手机号 新绑定的
    if (!this.isOwner() && !this.hasPhone()) {
      // 账户列表页面一直显示
      if (this.router && this.router.url === "/account") {
        this.showBindPhoneModal();
      } else if (this.isNewChildAccount()) {
        this.showBindPhoneModal();
      }
    }
  }

  showBindPhoneModal() {
    this.dialog.open(BindMobileModalComponent, {
      width: "500px",
      autoFocus: false,
      disableClose: true,
      data: {
        userInfo: this.userInfo,
      },
    });
  }

  translateLanguage(e) {
    this.iconType = this.curLang.changeLang();
  }

  show(typ) {
    this.showList = typ;
  }

  disappear(val) {
    if (!val) {
      this.isHasNotify = false;
    }
  }

  close(value) {
    if (!value) {
      this.showList = "";
    }
  }

  isOwner() {
    return this.userInfo.role && this.userInfo.role.toUpperCase() === "OWNER";
  }

  hasPhone() {
    return (
      (this.userInfo.operation_info && this.userInfo.operation_info["phone"]) ||
      (this.userInfo.business_info && this.userInfo.business_info["phone"])
    );
  }

  isNewChildAccount() {
    // 晚于这个时间创建的账号称为新的子账号 2020-04-02 00:00:00
    const publishDay = "2020-04-02 00:00:00";
    const deadLine = new Date(publishDay).getTime();
    const createdAt = new Date(
      parseInt(this.userInfo.created_at.toString(), 10) * 1000
    ).getTime();

    return this.userInfo && createdAt > deadLine;
  }
}
