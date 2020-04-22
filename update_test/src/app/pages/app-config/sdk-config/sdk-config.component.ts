import { Component, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { CurAppService } from "../../../service/cur-app.service";
import {
  App,
  APP_TYPE_H5,
  APP_TYPE_ANDROID,
  APP_TYPE_IOS,
  APP_TYPE_WX,
} from "../../../model";
import {
  NgForm,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { PasswordConfirmComponent } from "../../password-confirm/password-confirm.component";
import { ApiExperiment } from "adhoc-api";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-sdk-config",
  templateUrl: "./sdk-config.component.html",
  styleUrls: ["./sdk-config.component.scss"],
})
export class SdkConfigComponent implements OnInit {
  app: App;

  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_WX = APP_TYPE_WX;

  sdkForm: FormGroup;
  sdkTime: number;

  sdkVersion: string;

  sdkCode: string;

  constructor(
    private curApp: CurAppService,
    private fb: FormBuilder,
    private apiExperiment: ApiExperiment,
    private translate: TranslateService,
    private toastrService: ToastrService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.app = this.curApp.getApp();
    this.buildTimeForm();
    this.getSdkConfig();
    this.sdkCode = `
      <script src=https://sdk.appadhoc.com/ab.plus.js></script>
      <script>
      adhoc('init', {
      appKey: '${this.app.app_key}'
      })
      </script>
    `;
  }

  getSdkConfig() {
    this.apiExperiment.getSdkConfig(this.app.app_key).then((sdkConfig) => {
      this.sdkTime = sdkConfig["getflag_interval"];
      const alltxt = this.translate.instant("sdkcfg.all");
      this.sdkVersion = sdkConfig["app_lowest_version"]
        ? sdkConfig["app_lowest_version"]
        : alltxt;
    });
  }

  buildTimeForm(): void {
    this.sdkForm = this.fb.group({
      sdkTime: [this.sdkTime, Validators.compose([Validators.required])],
      sdkVersion: [this.sdkVersion, Validators.compose([Validators.required])],
    });
  }

  onSubmitTime() {
    if (!this.sdkForm.valid) {
      return;
    }
    const alltxt = this.translate.instant("sdkcfg.all");
    const obj = {
      getflag_interval: this.sdkTime,
      app_lowest_version: this.sdkVersion === alltxt ? "" : this.sdkVersion,
    };
    this.apiExperiment.setSdkConfig(this.app.id, obj).then((res) => {
      const data = res;
      if (data["error_code"] === 0) {
      } else {
      }
    });
  }

  saveTime() {
    const dialogRef = this.dialog.open(PasswordConfirmComponent, {});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmitTime();
      }
    });
  }

  clip(e) {
    const txt = this.translate.instant("sdkcfg.copy");
    this.toastrService.success(txt);
  }
}
