import { Component, OnInit } from "@angular/core";
import { ApiAuth } from "adhoc-api";
import { UserRole } from "../../model";
import { AuthGuard } from "../../system/auth-guard.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from "rxjs";

import {
  VEXBuiltInThemes,
  Modal,
  DialogPreset,
  DialogFormModal,
  DialogPresetBuilder,
  VEXModalContext,
  vexV3Mode,
  providers,
} from "ngx-modialog/plugins/vex";
import { MemberEditComponent } from "../../components/member-edit/member-edit.component";

@Component({
  selector: "app-management",
  templateUrl: "./management.component.html",
  styleUrls: ["./management.component.scss"],
})
export class ManagementComponent implements OnInit {
  members: Array<Object>;
  curMember;
  isLoading = true;

  constructor(
    private apiAuth: ApiAuth,
    public modal: Modal,
    private translate: TranslateService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getMembers();
  }

  async getMembers() {
    const members = await this.apiAuth.getMembers();
    this.members = members;
    if (this.members) {
      this.members.map(async (item) => {
        const res = await this.apiAuth.getAppsByUserid(item["id"]);
        item["apps"] = res ? res["apps"] : [];
      });
    }
    this.isLoading = false;
  }

  getRole(key) {
    return this.translate.get(UserRole[key]);
  }

  getAppNames(apps: Array<Object>) {
    if (!apps) {
      return [];
    }
    const names = apps.reduce((arr: Array<string>, app) => {
      arr.push(app["name"]);
      return arr;
    }, []);
    return names;
  }

  ban(member) {
    this.translate.get("management.banMsg").subscribe((text) => {
      this.confireDialog(text).then((resultPromise) => {
        return resultPromise.result.then((r) => {
          member.blocked = true;
          this.asyncMember(member);
        });
      });
    });
  }

  unban(member) {
    this.translate.get("management.unbanMsg").subscribe((text) => {
      this.confireDialog(text).then((resultPromise) => {
        return resultPromise.result.then((r) => {
          member.blocked = false;
          this.asyncMember(member);
        });
      });
    });
  }

  async asyncMember(member) {
    const res = await this.apiAuth.updateMembers({
      id: member.id,
      blocked: member.blocked,
    });
    (res) => {};
  }

  confireDialog(strmsg: string) {
    const ok = this.translate.get("modal.ok");
    const cancel = this.translate.get("modal.cancel");
    const all = forkJoin([ok, cancel]);
    const modal = this.modal.confirm();
    all.subscribe((result) => {
      modal
        .message(strmsg)
        .cancelBtn(result[1])
        .okBtn(result[0])
        .showCloseButton(true);
    });
    return modal.open();
  }

  edit(member) {
    this.curMember = member;
    const dialogRef = this.dialog.open(MemberEditComponent, {
      data: { member: this.curMember },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.curMember = false;
      this.ngOnInit();
    });
  }

  invite() {
    this.curMember = null;
    const dialogRef = this.dialog.open(MemberEditComponent, {
      data: { member: this.curMember },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.curMember = false;
      this.ngOnInit();
    });
  }
}

export const ManagementRouter = {
  path: "management",
  canActivate: [AuthGuard],
  component: ManagementComponent,
};
