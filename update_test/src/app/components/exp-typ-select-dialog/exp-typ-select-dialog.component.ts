import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { DialogPreset } from "ngx-modialog/plugins/vex";
import { CurAppService } from "../../service/cur-app.service";
import { App, APP_TYPE_H5, APP_TYPE_WX, VersionTyp } from "../../model";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-exp-typ-select-dialog",
  templateUrl: "./exp-typ-select-dialog.component.html",
  styleUrls: ["./exp-typ-select-dialog.component.scss"],
})
export class ExpTypSelectDialogComponent implements OnInit {
  public context: DialogPreset;
  app: App;
  public versionTyp = VersionTyp;
  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_WX = APP_TYPE_WX;
  expType;

  constructor(
    private router: Router,
    private curApp: CurAppService,
    public dialogRef: MatDialogRef<ExpTypSelectDialogComponent>
  ) {
    this.app = this.curApp.getApp();
    this.expType = this.versionTyp.EXP_TYPE_CODE;
  }

  ngOnInit() {}

  show() {
    this.dialogRef.close();
    const typDict = {};
    typDict[VersionTyp.EXP_TYPE_CODE] = "/new/code";
    typDict[VersionTyp.EXP_TYPE_BUILD] = "/new/build";
    typDict[VersionTyp.EXP_TYPE_URL] = "/new/url";
    const routerPath = typDict[this.expType];
    this.router.navigate([routerPath]);
  }
}
