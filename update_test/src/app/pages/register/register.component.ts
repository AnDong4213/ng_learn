import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { User } from '../../model';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { emailValidator } from '../../utils/validators/email';
import { pwdRepeatValidator } from '../../utils/validators/pwd-repeat';

import { ActivatedRoute, Router } from '@angular/router';

import { Modal } from 'ngx-modialog/plugins/vex';

import { ApiAuth } from 'adhoc-api';
import { pwdValidator } from '../../utils/validators/pwd';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  user: User;
  error_msg: string;
  userForm: FormGroup;
  submitted: boolean = false;
  ischeck: boolean = false;

  constructor(private apiAuth: ApiAuth,
    private fb: FormBuilder,
    private router: Router,
    vcRef: ViewContainerRef,
    public modal: Modal,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toast: ToastrService) {
    this.user = new User();
  }

  ngOnInit() {
    this.buildForm();
  }

  async submit(f) {
    this.submitted = true;
    if (!f.valid) {
      return;
    }
    this.user.username = this.userForm.value.username;
    this.user.password = this.userForm.value.password;
    this.user.inviteCode = this.userForm.value.inviteCode;

    let res = await this.apiAuth.register(this.user)

    const data = res;
    if (data['error_code']) {
      this.error_msg = data['reason_display'];
      this.cleanErrorMsg();
      this.toast.error(data['reason_display']);

    } else {
      this.notifySuccessMsg();

    }

  }

  cleanErrorMsg() {
    setTimeout(() => {
      this.error_msg = '';
    }, 1000);
  }

  buildForm(): void {

    this.userForm = this.fb.group({
      username: [this.user.username,
      Validators.compose([
        Validators.required,
        emailValidator()
      ])
      ],
      inviteCode: [this.user.inviteCode,
      Validators.compose([
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(7)
      ])
      ],
      password: [this.user.password,
      Validators.compose([
        Validators.required,
        pwdValidator
      ])
      ],
      repwd: [
        this.user.repwd,
        Validators.required
      ],
      ischeck: [
        ''
      ]
    }, { validator: pwdRepeatValidator('password', 'repwd') });

  }

  notifySuccessMsg() {


    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'register.send']);
    this.modal.confirm()
      .message(dic['register.send'])
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

export const RegisterRouter = {
  path: 'register',
  component: RegisterComponent
};
