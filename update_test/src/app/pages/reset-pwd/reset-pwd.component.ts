import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pwdRepeatValidator } from '../../utils/validators/pwd-repeat';
import { pwdValidator } from '../../utils/validators/pwd';

import { Modal } from 'ngx-modialog/plugins/vex';

import { ApiAuth } from 'adhoc-api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-pwd',
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-pwd.component.scss']
})
export class ResetPwdComponent implements OnInit {

  password: string;
  repassword: string;

  email: string;
  code: string;

  userForm: FormGroup;
  submitted: Boolean = false;
  isSuccess = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private apiAuth: ApiAuth,
    vcRef: ViewContainerRef,
    public modal: Modal,
    private translate: TranslateService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.code = this.route.snapshot.params['code'];
    this.email = this.route.snapshot.params['email'];
    this.buildForm();
  }

  async submit(f) {
    this.submitted = true;
    if (!f.valid) {
      return;
    }
    const res = await this.apiAuth.reset(this.email, this.password, this.code)

    const data = res;
    if (data['error_code'] === 0) {
      this.isSuccess = true;
      this.notifySuccess();
    } else {
      this.notifyFail(data['reason_display']);
    }

  }

  notifyMsg(msg, callback) {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok']);
    this.modal.confirm()
      .message(msg)
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
          return callback();
        }).catch(err => {
          return callback();
        });
      });
  }

  notifySuccess() {
    const txt = this.translate.instant('resetpwd.resetsuccess');
    const str = txt;
    this.notifyMsg(str, () => {
      this.router.navigate(['/login']);
    });
  }

  notifyFail(str) {
    this.notifyMsg(str, () => {
      this.router.navigate(['/login']);
    });
  }

  buildForm(): void {
    this.userForm = this.fb.group({
      password: [this.password,
      Validators.compose([
        Validators.required,
        pwdValidator
      ])
      ],
      repassword: [
        this.repassword,
        Validators.required
      ]
    }, { validator: pwdRepeatValidator('password', 'repassword') });
  }

}

export const ResetPwdRouter = {
  path: 'resetpwd/:email/:code',
  component: ResetPwdComponent
};
