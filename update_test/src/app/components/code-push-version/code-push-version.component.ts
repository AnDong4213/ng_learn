import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ApiExperiment } from "adhoc-api";
import { AuthService } from "../../service/auth.service";
import { CurAppService } from "../../service/cur-app.service";
import { User, VersionStatus, Experiment, Version, App } from "../../model";
import { checkIfPwdValid } from "../../utils/validators/check-pwd-valid";

@Component({
  selector: "app-code-push-version",
  templateUrl: "./code-push-version.component.html",
  styleUrls: ["./code-push-version.component.scss"],
})
export class CodePushVersionComponent implements OnInit {
  curExp: Experiment;
  error_msg: string;
  user: User;
  app: App;
  versions: Array<Version>;
  pwdForm: FormGroup;
  submited: Boolean = false;
  versionStatus = VersionStatus;

  constructor(
    private authService: AuthService,
    private apiExp: ApiExperiment,
    private curApp: CurAppService,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    public dialogRef: MatDialogRef<CodePushVersionComponent>,
    private fb: FormBuilder
  ) {
    this.user = new User();
  }

  ngOnInit() {
    this.app = this.curApp.getApp();
    this.buildForm();
  }

  close() {
    this.dialogRef.close();
  }

  async submit(form) {
    this.submited = true;
    if (!form.valid) {
      return;
    }

    this.user.username = this.authService.getUser();
    this.user.password = this.pwdForm.value.password;
    this.authService.login(this.user, (res) => {
      if (res.hasOwnProperty("error_code") || res["error_code"] == "20001") {
        this.error_msg = "请输入正确的密码";
        this.cleanErrorMsg();
      } else {
        this.dialogRef.close(true);
      }
    });
  }

  cleanErrorMsg() {
    setTimeout(() => {
      this.error_msg = null;
    }, 1000);
  }

  buildForm(): void {
    this.pwdForm = this.fb.group({
      password: [
        this.user.password,
        Validators.compose([
          Validators.required,
          // checkIfPwdValid()
        ]),
      ],
    });
  }

  checkIfPwdValid() {
    return true;
  }
}
