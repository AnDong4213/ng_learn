import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  Inject,
} from "@angular/core";
import { Audience, White_List } from "../../model";
import { Router } from "@angular/router";
import { AuthGuard } from "../../system/auth-guard.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-user-filter",
  templateUrl: "./user-filter.component.html",
  styleUrls: ["./user-filter.component.scss"],
})
export class UserFilterComponent implements OnInit {
  audiences: Array<Audience>;
  curAudienceName: string;
  curAudienceId: string;
  newAudience: string;
  defaultAudience: any;
  data = new Array<any>();

  White_List = White_List;

  constructor(
    private router: Router,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<UserFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any
  ) {}

  ngOnInit() {
    this.audiences = this.datas.audiences;
    this.curAudienceId = this.datas.curAudienceId;
    this.curAudienceName = this.datas.curAudienceName;

    this.audiences.forEach((a) => {
      if (a.name === White_List && a.description === "") {
        return;
      }

      this.data.push({ id: a.id, text: a.name });
    });

    const dic = this.translate.instant("userfiler.all");
    this.data.push({ id: "all", text: dic });

    if (this.curAudienceId === "") {
      this.defaultAudience = this.data[this.data.length - 1];
    } else {
      this.defaultAudience = this.data.find((d) => {
        return d.id === this.curAudienceId;
      });

      if (!this.defaultAudience) {
        this.defaultAudience = { id: "all", text: dic };
      }
    }

    this.newAudience = this.curAudienceId;
  }

  switchFilter(value) {
    this.newAudience = value.id;
  }

  selectAudience(value) {
    this.newAudience = value;
  }

  // 关闭弹框
  close() {
    this.dialogRef.close();
  }
  // 确定选中
  ok() {
    this.newAudience === "all" ? (this.newAudience = "") : "";
    this.dialogRef.close(this.newAudience);
  }

  show() {
    this.dialogRef.close();
    this.router.navigate(["/user_filter_edit"]);
  }
}

export const UserFilterRouter = {
  path: "user_filter",
  canActivate: [AuthGuard],
  component: UserFilterComponent,
};
