import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { AuthGuard } from '../../system/auth-guard.service';


import { Router } from '@angular/router';
import { pwdRepeatValidator } from '../../utils/validators/pwd-repeat';
import { pwdValidator } from '../../utils/validators/pwd';
import { ApiAuth } from 'adhoc-api';


import { Modal } from 'ngx-modialog/plugins/vex';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.scss']
})
export class ChangeEmailComponent implements OnInit {

  oldemail: string;
  newemail: string;
  emailForm: FormGroup;
  submitted: Boolean = false;

  error_msg: string;
  isChange: Boolean = false;

  constructor(private fb: FormBuilder,
    private apiAuth: ApiAuth,
    private router: Router,
    private translate: TranslateService,
    vcRef: ViewContainerRef,
    public modal: Modal) {
  }

  ngOnInit() {
    this.buildForm();
  }

  async submit(form) {
    this.submitted = true;
    if (!form.valid) {
      return;
    }

    const res = await this.apiAuth.changeEmail(this.oldemail, this.newemail)

    const data = res;
    if (data['error_code']) {
      this.error_msg = data['reason_display'];
    } else {
      // this.notifySuccessMsg();
      this.isChange = true;
    }

  }

  buildForm(): void {
    this.emailForm = this.fb.group({
      oldemail: [this.oldemail,
      Validators.compose([
        Validators.required
      ])
      ],
      newemail: [this.newemail,
      Validators.compose([
        Validators.required
      ])
      ]
    }
      //   , { validator: pwdRepeatValidator('newpasswd', 'repasswd') }
    );
  }

  notifySuccessMsg() {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'changeemail.success']);
    this.modal.confirm()
      .message(dic['changeemail.success'])
      .cancelBtn(dic['changeemail.cancel'])
      .okBtn(dic['changeemail.ok'])
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

export const ChangeEmailRouter = {
  path: 'change_email',
  canActivate: [AuthGuard],
  component: ChangeEmailComponent
};
