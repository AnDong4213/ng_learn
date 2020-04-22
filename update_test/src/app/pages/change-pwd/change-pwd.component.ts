import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { AuthGuard } from '../../system/auth-guard.service';


import { Router } from '@angular/router';
import { pwdRepeatValidator } from '../../utils/validators/pwd-repeat';
import { pwdValidator } from '../../utils/validators/pwd';
import { ApiAuth } from 'adhoc-api';
import { ToastrService } from 'ngx-toastr';


import { Modal } from 'ngx-modialog/plugins/vex';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.scss']
})
export class ChangePwdComponent implements OnInit {
  oldpasswd: string;
  newpasswd: string;
  repasswd: string;

  userForm: FormGroup;
  submitted: Boolean = false;

  error_msg: string;

  isChange: Boolean = false;

  constructor(private fb: FormBuilder,
    private apiAuth: ApiAuth,
    private router: Router,
    private translate: TranslateService,
    vcRef: ViewContainerRef,
    public modal: Modal,
    private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  async submit(form) {
    this.submitted = true;
    if (!form.valid) {
      return;
    }

    const res = await this.apiAuth.change(this.userForm.value.oldpasswd, this.userForm.value.newpasswd)
    const data = res as Object;
    if (data['error_code']) {
      this.error_msg = data['reason_display'];
      this.toastrService.error(this.error_msg);
    } else {
      // this.notifySuccessMsg();
      this.isChange = true;
    }

  }

  buildForm(): void {
    this.userForm = this.fb.group({
      oldpasswd: [this.oldpasswd,
      Validators.compose([
        Validators.required,
        pwdValidator
      ])
      ],
      newpasswd: [this.newpasswd,
      Validators.compose([
        Validators.required,
        pwdValidator
      ])
      ],
      repasswd: [
        this.repasswd,
        Validators.required
      ]
    }, { validator: pwdRepeatValidator('newpasswd', 'repasswd') });
  }

  notifySuccessMsg() {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'changepwd.success']);
    this.modal.confirm()
      .message(dic['changepwd.success'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
          this.router.navigate(['/login']);
        }).catch(err => {
          this.router.navigate(['/login']);
        });
      });
  }

}

export const ChangePwdRouter = {
  path: 'change_pwd',
  canActivate: [AuthGuard],
  component: ChangePwdComponent
};
