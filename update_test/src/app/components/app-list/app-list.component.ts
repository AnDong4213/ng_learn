import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { App, AppType, APP_TYPE_H5, APP_TYPE_ANDROID, APP_TYPE_IOS, APP_TYPE_LPO, APP_TYPE_DEF, APP_TYPE_WX, UserInfo } from '../../model';
import { ApiAuth } from 'adhoc-api';
import { AuthService } from '../../service/auth.service';
import { CurAppService } from '../../service/cur-app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {

  @Output() isShow = new EventEmitter<boolean>();
  // curApp$;
  @Input() curApp$: Subject<App>;

  myApps: Array<App>;
  apps: Array<App>;
  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_LPO = APP_TYPE_LPO;
  APP_TYPE_DEF = APP_TYPE_DEF;
  APP_TYPE_WX = APP_TYPE_WX;

  constructor(private apiAuth: ApiAuth,
    private authService: AuthService,
    private curApp: CurAppService,
    private router: Router,
    private route: ActivatedRoute) { }

  async ngOnInit() {
    // this.curApp$ = this.curApp.getApp$();
    const userEmail = await this.authService.getUser();
    let userinfo = await this.apiAuth.getUserInfo(userEmail)

    this.getAllApps((userinfo as UserInfo).id);

  }

  close() {
    this.isShow.emit(false);
  }

  async getAllApps(userid: string) {
    let result = await this.apiAuth.getAllApp();

    const d = result as Array<App>;
    this.myApps = d.filter(app => app.author_id === userid);
    this.apps = d.filter(app => app.author_id !== userid);

  }

  selectApp(app: App) {
    if (app.typ === AppType.LPO) {
      this.curApp.setCookie(app.id);
      this.curApp.goLPO();
      return;
    }
    this.curApp.setApp(app);
    this.curApp$.next(app);
    this.close();
    this.router.navigate(['/']);
  }

}
