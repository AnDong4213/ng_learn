import { Component, OnInit, Inject } from "@angular/core";

import { UserFilterCreateComponent } from "../user-filter-create/user-filter-create.component";
import { WhiteListDialogComponent } from "../../components/white-list-dialog/white-list-dialog.component";
import { overlayConfigFactory } from "ngx-modialog";

import {
  App,
  Audience,
  APP_TYPE_ANDROID,
  APP_TYPE_IOS,
  White_List,
} from "../../model";
import { CurAppService } from "../../service/cur-app.service";
import { ApiExperiment } from "adhoc-api";
import { AuthGuard } from "../../system/auth-guard.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
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
import { Experiment } from "../../model/experiment";

@Component({
  selector: "app-user-filter-edit",
  templateUrl: "./user-filter-edit.component.html",
  styleUrls: ["./user-filter-edit.component.scss"],
})
export class UserFilterEditComponent implements OnInit {
  app: App;
  audiences: Array<Audience>;
  exps: Array<Experiment>;
  isHaveAudiences: boolean;
  ifShowWhiteList: Boolean = false;
  ifwlCreated: Boolean = false;
  rule: string = "";
  audience: Audience;
  whiteListAudience: Audience;

  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  White_List = White_List;

  constructor(
    public modal: Modal,
    private curApp: CurAppService,
    private apiExperiment: ApiExperiment,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.app = this.curApp.getApp();
    this.getExperiments(this.app.id);
    if (this.app.typ === APP_TYPE_ANDROID || this.app.typ === APP_TYPE_IOS) {
      this.ifShowWhiteList = true;
    }
  }

  getExperiments(appid) {
    this.apiExperiment.getAllExperiments(appid).then((exps) => {
      this.exps = exps as Experiment[];
      this.getAudiences(appid);
    });
  }

  getAudiences(appid) {
    this.apiExperiment.getAudiences(appid).then((audiences) => {
      this.audiences = audiences as Array<Audience>;
      this.audiences = this.audiences.filter((a) => a.deleted == false);
      this.getConditionStr(this.audiences);
      this.isHaveAudiences = this.audiences.length > 0 ? true : false;

      this.audiences.map((item) => {
        if (item.name === White_List && item.description === "") {
          this.ifwlCreated = false;
        } else if (item.name === White_List && item.description != "") {
          this.ifwlCreated = true;
        }
      });

      // this.findExp();
    });
  }

  getConditionStr(audiences) {
    audiences.forEach((audience) => {
      let name = "",
        nameStr = "";
      audience.new_conditions.forEach((c) => {
        c.name == "left_bracket"
          ? (name = "( ")
          : c.name == "right_bracket"
          ? (name = " )")
          : c.name == "equal"
          ? (name = " = ")
          : c.name == "not_equal"
          ? (name = " != ")
          : c.name == "include"
          ? (name = " ⊇ ")
          : c.name == "exclude"
          ? (name = " ⊉  ")
          : c.name == "bigger"
          ? (name = " > ")
          : c.name == "smaller"
          ? (name = " < ")
          : c.name == "and"
          ? (name = " && ")
          : c.name == "or"
          ? (name = " || ")
          : (name = c.name);

        nameStr += decodeURIComponent(name);
      });
      if (audience.name === White_List && audience.description != "") {
        this.rule = nameStr;
      } else if (audience.name === White_List && audience.description === "") {
        audience.conditions = nameStr;
        this.rule = "";
      } else {
        audience.conditions = nameStr;
      }
    });
  }

  findExp() {
    let expsNames = Array<any>();
    this.audiences.forEach((au) => {
      this.exps.forEach((exp) => {
        if (exp.control.audience_id == au.id) {
          expsNames.push(exp.name);
        }
      });
      au.exps = expsNames;
      expsNames = [];
    });
  }

  userFilterCreate() {
    const dialogRef = this.dialog.open(UserFilterCreateComponent, {
      data: {
        audiences: this.audiences,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getExperiments(this.app.id);
      }
    });
  }

  updateAudience(data, audience) {
    audience.name = data;

    this.apiExperiment
      .updateAudiences(this.app.id, audience.id, audience)
      .then((exps) => {});
  }

  delAudience(audience) {
    this.modal
      .confirm()
      .message(`确认要删除受众条件[${audience.name}]吗？`)
      .cancelBtn("取消")
      .okBtn("确认")
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {
            this.apiExperiment
              .delAudiences(this.app.id, audience.id)
              .then((exps) => {
                const index = this.audiences.findIndex(
                  (item) => item.id === audience.id
                );
                if (index > -1) {
                  this.audiences.splice(index, 1);
                }
              });
          },
          (err) => {}
        );
      });
  }

  whiteListAdd(event) {
    this.whiteListAudience = this.audiences.filter((item) => {
      return item.name === White_List;
    })[0];

    let whiteListRef;
    if (this.whiteListAudience) {
      whiteListRef = this.dialog.open(WhiteListDialogComponent, {
        data: {
          appId: this.app.id,
          audienceId: this.whiteListAudience.id,
          audience: this.whiteListAudience,
        },
      });
    } else {
      whiteListRef = this.dialog.open(WhiteListDialogComponent, {
        data: {
          appId: this.app.id,
        },
      });
    }

    whiteListRef.afterClosed().subscribe((result) => {
      this.getExperiments(this.app.id);
    });
  }

  whiteListEdit(event) {
    this.whiteListAudience = this.audiences.filter((item) => {
      return item.name === White_List;
    })[0];

    const whiteListRefEdit = this.dialog.open(WhiteListDialogComponent, {
      data: {
        appId: this.app.id,
        audienceId: this.whiteListAudience.id,
        audience: this.whiteListAudience,
      },
    });

    whiteListRefEdit.afterClosed().subscribe((result) => {
      if (result === "noCon") {
        this.apiExperiment.getAllExperiments(this.app.id).then((exps) => {
          this.exps = exps as Experiment[];
          this.exps.map((exp) => {
            const cond = exp.control.conditions;
            if (cond.length !== 0) {
              cond.map((item) => {
                if (item["name"] === "White_List_Device") {
                  const allVersion = exp.getVersions();
                  allVersion.map((v) => {
                    v.audience_id = "";
                    v.conditions = [];
                  });

                  this.apiExperiment.updateExpWithVersions(exp.id, allVersion);
                }
              });
            }
          });
        });
      } else if (result === "editCon") {
        this.apiExperiment.getAllExperiments(this.app.id).then((exps) => {
          this.exps = exps as Experiment[];
          this.exps.map((exp) => {
            const cond = exp.control.conditions;
            if (cond.length !== 0) {
              cond.map((item) => {
                if (item["name"] === "White_List_Device") {
                  const allVersion = exp.getVersions();
                  allVersion.map((v) => {
                    v.conditions = this.whiteListAudience.new_conditions;
                  });

                  this.apiExperiment.updateExpWithVersions(exp.id, allVersion);
                }
              });
            }
          });
        });
      }
      this.getAudiences(this.app.id);
    });
  }
}

export const UserFilterEditRouter = {
  path: "user_filter_edit",
  canActivate: [AuthGuard],
  component: UserFilterEditComponent,
};
