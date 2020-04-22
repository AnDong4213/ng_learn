import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiAuth } from 'adhoc-api';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { App, UserInfo, AppType, APP_TYPE_H5, APP_TYPE_IOS, APP_TYPE_ANDROID, APP_TYPE_LPO, APP_TYPE_WX } from '../../model';
import { AuthGuard } from '../../system/auth-guard.service';
import { CurAppService } from '../../service/cur-app.service';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-app-new',
  templateUrl: './app-new.component.html',
  styleUrls: ['./app-new.component.scss']
})
export class AppNewComponent implements OnInit, OnDestroy {
  submitted = false;
  appForm: FormGroup;
  app: App;
  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_LPO = APP_TYPE_LPO;
  APP_TYPE_WX = APP_TYPE_WX;
  createSuccess = false;

  constructor(private apiAuth: ApiAuth,
    private curApp: CurAppService,
    private route: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private translate: TranslateService,
    private toastrService: ToastrService) {
    this.app = new App({
      typ: APP_TYPE_H5
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  async submit(form) {
    this.submitted = true;
    if (!form.valid) {
      return;
    }
    this.app.typ = form.value.typ;
    this.app.name = form.value.name;
    let appResult = await this.apiAuth.createApp(this.app)

    this.app = appResult as App;
    this.createSuccess = true;
    this.appForm.controls['name'].disable({ onlySelf: true });

  }

  buildForm(): void {
    this.appForm = this.fb.group({
      name: [this.app.name,
      Validators.compose([
        Validators.required,
        Validators.pattern('^[\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5a-zA-Z0-9_]*$')
      ])
      ],
      typ: [
        this.app.typ,
        Validators.compose([
          Validators.required
        ])
      ]
    });
  }

  goApp() {
    if (this.app.typ === AppType.LPO) {
      this.curApp.setCookie(this.app.id);
      this.curApp.goLPO();
      return;
    }
    this.curApp.setApp(this.app);
    this.route.navigate(['/']);
  }

  clip(e) {
    const txt = this.translate.instant('explist.copy');
    this.toastrService.success(txt);
  }


  ngOnDestroy() {
  }


}

export const AppNewRouter = {
  path: 'app_new',
  canActivate: [AuthGuard],
  component: AppNewComponent
};
