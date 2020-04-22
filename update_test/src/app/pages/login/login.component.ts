import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../service/auth.service';
import { ApiAuth } from 'adhoc-api';
import { User, UserInfo } from '../../model';
import { TokenService } from '../../service/token.service';
import { CurAppService } from '../../service/cur-app.service';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/vex';

import { emailValidator } from '../../utils/validators/email';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user: User;
  error_msg: string;

  userForm: FormGroup;
  submitted: Boolean = false;

  constructor(private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private apiAuth: ApiAuth,
    overlay: Overlay,
    vcRef: ViewContainerRef,
    public modal: Modal,
    private translate: TranslateService,
    private curApp: CurAppService,
    private fb: FormBuilder
  ) {
    this.user = new User();
  }

  ngOnInit() {

    this.buildForm();

  }

  submit(form) {
    this.submitted = true;
    if (!form.valid) {
      return;
    }
    this.user.username = this.userForm.value.username;
    this.user.password = this.userForm.value.password;

    this.authService.login(this.user, async (res) => {

      if (res.hasOwnProperty('error_code')) {
        this.notifyUnactive(res.reason_display, res.reason);
      } else if (res.hasOwnProperty('error_code')) {
        this.error_msg = res.reason_display;
        this.cleanErrorMsg();
      } else {
        this.tokenService.setToken(res.auth_key);
        this.authService.setUser(this.user.username);

        const userinfo = await this.apiAuth.getUserInfo(this.user.username)

        const user = userinfo as UserInfo;

        this.curApp.cleanApp();
        this.router.navigate(['']);
      }

    });

  }

  cleanErrorMsg() {
    setTimeout(() => {
      this.error_msg = null;
    }, 1000);
  }


  async notifyUnactive(msg, reason) {
    if (reason == 'user not activated') {
      const res = await this.apiAuth.reactive(this.user.username);
    }

    const dic = this.translate.instant(['modal.cancel', 'modal.ok']);
    this.modal.confirm()
      .message(msg)
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open();
  }


  buildForm(): void {
    this.userForm = this.fb.group({
      username: [this.user.username,
      Validators.compose([
        Validators.required,
        emailValidator()
      ])
      ],
      password: [this.user.password,
      Validators.required
      ]
    });
  }



}



export const LoginRouter = {
  path: 'login',
  component: LoginComponent
};
