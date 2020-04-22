import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiAuth } from 'adhoc-api';

import { emailValidator } from '../../utils/validators/email';

import { Router } from '@angular/router';


import { Modal } from 'ngx-modialog/plugins/vex';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {
  email: string;
  error_msg: string;
  emailForm: FormGroup;

  submitted: Boolean = false;
  isSuccess = false;

  constructor(private apiAuth: ApiAuth,
    private router: Router,
    vcRef: ViewContainerRef,
    public modal: Modal,
    private translate: TranslateService,
    private fs: FormBuilder) {
  }

  ngOnInit() {
    this.buildForm();
  }


  async submit(f) {
    this.submitted = true;
    if (!f.valid) {
      return;
    }
    this.email = this.emailForm.value.email
    const res = await this.apiAuth.forget(this.email)

    if (res['error_code'] === 0) {
      this.notifySuccess();
    } else {
      this.error_msg = res['error_code'];
    }

  }

  async resend() {
    const res = await this.apiAuth.forget(this.email)
    if (res['error_code'] === 0) {
      this.notifySuccess();
    } else {
      this.error_msg = res['error_code'];
    }

  }

  notifySuccess() {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'forgot.sended']);
    this.modal.confirm()
      .message(dic['forgot.sended'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {

        return resultPromise.result.then(r => {
          // this.router.navigate(['/login']);
          this.isSuccess = true;
        }).catch(err => {
          this.router.navigate(['/login']);
        });

      });
  }

  buildForm() {
    this.emailForm = this.fs.group({
      email: [
        this.email,
        Validators.compose([
          Validators.required,
          emailValidator()
        ])
      ]
    });
  }

}

export const ForgotRouter = {
  path: 'forgot',
  component: ForgotComponent
};
