import { Component, OnInit, Input, OnDestroy } from "@angular/core";

import { UserFilterComponent } from "../../../user-filter/user-filter.component";
import { AiStatSelectDialogComponent } from "../../../../components/ai-stat-select-dialog/ai-stat-select-dialog.component";
import { ExpIdDialogComponent } from "../../../../components/exp-id-dialog/exp-id-dialog.component";
import { overlayConfigFactory } from "ngx-modialog";

import {
  Experiment,
  Version,
  VersionStatus,
  Audience,
  VersionTyp,
  AppType,
  App,
} from "../../../../model";
import { Observable } from "rxjs";
import { ISubscription } from "rxjs/Subscription";

import { TranslateService } from "@ngx-translate/core";

import { ApiExperiment } from "adhoc-api";
import { CurAppService } from "../../../../service/cur-app.service";
import { ABService } from "../../../../service/ab.service";
import { Subject } from "rxjs";
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
import { ToastrService } from "ngx-toastr";
import { Role } from "../../../../model/role";

@Component({
  selector: "app-operation-control",
  templateUrl: "./operation-control.component.html",
  styleUrls: ["./operation-control.component.scss"],
})
export class OperationControlComponent implements OnInit, OnDestroy {
  @Input() exp$: Subject<Experiment>;
  app: App;
  curExp: Experiment;
  appid: string;
  versions: Array<Version>;
  subscription: ISubscription;
  elseTraffic: number;
  curTraffic: number;
  vs = VersionStatus;
  audienceName: string;
  audienceId: string;
  audienceCondition: string;
  audiences: Array<Audience>;
  exps: Array<Experiment>;
  otheslayers: Array<any>;

  copyVersion: Array<Version>;

  aiRole = [Role.ai];

  isAi = false;
  appType = AppType;

  isTrafficChange = false;

  oldVersions: Array<Version>;
  audienceRole = [Role.audience];

  allURLMatch: Array<Experiment> = new Array<Experiment>();

  constructor(
    public modal: Modal,
    private curApp: CurAppService,
    private apiExp: ApiExperiment,
    private ab: ABService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    public dialog: MatDialog
  ) {
    if (curApp.getApp()) {
      this.app = curApp.getApp();
      this.appid = this.app.id;
    }
  }

  ngOnInit() {
    this.subscription = this.exp$.subscribe((exp) => {
      this.curExp = exp;
      this.isAi = this.curExp.is_ai;
      this.versions = (exp as Experiment)
        .getVersions()
        .sort(this.sortVersionsByName);
      this.oldVersions = (exp as Experiment).getVersions();
      this.curTraffic = exp.traffic;
      this.reduceElseTraffice().then((exps) => {
        this.allURLMatch = this.exps.filter(
          (expitem) =>
            expitem.status === VersionStatus.Run &&
            (expitem.typ === VersionTyp.EXP_TYPE_BUILD ||
              expitem.typ === VersionTyp.EXP_TYPE_URL) &&
            expitem.id !== this.curExp.id &&
            this.app.typ === AppType.H5
        );
      });
      this.findAudienceName(this.curExp.control.audience_id);
      this.getAllAudience(this.appid);
    });
  }

  sortVersionsByName(a, b) {
    if (a.created_at + a.last_modified !== b.created_at + b.last_modified) {
      return a.created_at + a.last_modified - (b.created_at + b.last_modified);
    }
    try {
      const aIndex = a.name.indexOf("_");
      const bIndex = b.name.indexOf("_");
      return (
        a.name.slice(0, aIndex).split("版本")[1] -
        b.name.slice(0, bIndex).split("版本")[1]
      );
    } catch (err) {
      console.log("名字规则不正确");
    }
  }
  findAudienceName(audienceid) {
    if (!audienceid || audienceid === "") {
      this.audienceName = "全部";
      this.audienceId = "";
    } else {
      this.getAudiences(this.appid, audienceid);
    }
  }

  getAudiences(appid, audienceid) {
    this.apiExp.getAudiences(appid).then((audiences) => {
      this.audiences = audiences as Array<Audience>;
      this.audiences.filter((au) => {
        if (au.id === audienceid) {
          this.audienceName = au.name;
          this.audienceId = au.id;
          this.audienceCondition = this.setConditions(au);
        }
      });
    });
  }

  setConditions(audience: Audience) {
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
        : c.name == "bigger"
        ? (name = " > ")
        : c.name == "smaller"
        ? (name = " < ")
        : c.name == "and"
        ? (name = " && ")
        : c.name == "or"
        ? (name = " || ")
        : (name = c.name);
      nameStr += name;
    });
    return nameStr;
  }

  getAllAudience(appid) {
    this.apiExp.getAudiences(appid).then((audiences) => {
      this.audiences = audiences as Array<Audience>;
      this.audiences = this.audiences.filter((a) => a.deleted === false);
    });
  }

  reduceElseTraffice() {
    return this.apiExp.getAllExperiments(this.appid).then((exps) => {
      this.exps = exps as Array<Experiment>;
      const sameLayerExps = this.exps.filter(
        (exp) =>
          exp.id !== this.curExp.id && exp.layer_id === this.curExp.layer_id
      );
      this.elseTraffic =
        100 -
        sameLayerExps.reduce(
          (sum: number, exp: Experiment) => (sum += exp.traffic),
          0
        );
    });
  }

  avgTraffic(e) {
    this.curTraffic = e.value;

    this.versions.map((v) => {
      v.traffic = Math.floor(this.curTraffic / this.versions.length);
    });
    this.curTraffic =
      Math.floor(this.curTraffic / this.versions.length) * this.versions.length;

    this.isTrafficChange = true;
  }

  changeTraffic() {
    this.apiExp
      .updateExpWithVersions(this.versions[0].group_id, this.versions)
      .then((res) => {
        this.curExp.setVersions(this.versions);
        this.exp$.next(this.curExp);
        this.toastrService.success("流量修改成功");
      });
  }

  saveTrafficConfirm() {
    const dic = this.translate.instant([
      "modal.cancel",
      "modal.ok",
      "operation.issave",
    ]);
    this.modal
      .confirm()
      .message(dic["operation.issave"])
      .cancelBtn(dic["modal.cancel"])
      .okBtn(dic["modal.ok"])
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {
            this.changeTraffic();
          },
          (err) => {
            this.versions = this.oldVersions;
            this.curTraffic = this.curExp.traffic;
            this.isTrafficChange = false;
          }
        );
      });
  }

  openSetFilter() {
    const dialogRef = this.dialog.open(UserFilterComponent, {
      data: {
        audiences: this.audiences,
        curAudienceName: this.audienceName,
        curAudienceId: this.audienceId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return;
      }
      this.selectedAudience(result);
    });
  }

  selectedAudience(value) {
    if (this.audienceId === value) {
      return;
    }

    if (value === "") {
      this.updateVersionsAudience("", []);
    } else {
      const newAudience = this.audiences.filter(
        (a) => a.id === value
      )[0] as Audience;
      this.updateVersionsAudience(newAudience.id, newAudience.new_conditions);
    }
  }

  updateVersionsAudience(id, conditonns) {
    const allVersion = this.curExp.getVersions();
    allVersion.map((v) => {
      v.audience_id = id;
      v.conditions = conditonns;
    });
    this.apiExp
      .updateExpWithVersions(this.curExp.id, allVersion)
      .then((res) => {
        this.findAudienceName(id);
        this.exp$.next(res as Experiment);
      });
  }

  sliderChange(e, v: Version) {
    const count = this.versions.reduce((sum, i) => {
      if (i.id !== v.id) {
        sum += i.traffic;
      }
      return sum;
    }, 0);
    if (count + e.value > this.elseTraffic) {
      v.traffic = this.elseTraffic - count;
      e.source.value = v.traffic;
    } else {
      v.traffic = e.value;
      e.source.value = v.traffic;
    }

    this.curTraffic = this.versions.reduce(
      (sum, i) => (sum += Number(i.traffic)),
      0
    );
    this.isTrafficChange = true;
  }

  // 使用事件控制input的值的输入
  valueInput(num, v: Version) {
    let thisVal = num.target.value.replace(/\D/g, "");
    const evalue = Number(thisVal);
    v.traffic = evalue;

    const count = this.versions.reduce((sum, i) => {
      if (i.id !== v.id) {
        sum += i.traffic;
      }
      return sum;
    }, 0);
    if (count + evalue > this.elseTraffic) {
      v.traffic = this.elseTraffic - count;
      num.target.value = v.traffic;
    } else {
      v.traffic = evalue;
      num.target.value = v.traffic;
    }
    this.curTraffic = this.versions.reduce(
      (sum, i) => (sum += Number(i.traffic)),
      0
    );
    this.isTrafficChange = true;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  runExp() {
    if (this.curExp.control.stats.length <= 0) {
      this.toastrService.warning("试验必须包含至少一个指标");
      return;
    }
    if (this.curExp.typ === VersionTyp.EXP_TYPE_CODE) {
      if (this.isSameFlag()) {
        this.toastrService.warning(
          "已有正在运行的相同变量的分层试验，分层试验不可使用相同变量。"
        );
        return;
      }
    }

    if (
      (this.curExp.typ === VersionTyp.EXP_TYPE_BUILD ||
        this.curExp.typ === VersionTyp.EXP_TYPE_URL) &&
      this.app.typ === this.appType.H5
    ) {
      const result = this.hasSameUrl();
      if (result) {
        this.toastrService.warning(
          "链接与其他试验存在冲突，请停止相关试验后再运行本试验。"
        );
        return;
      }
    }

    if (!this.curExp.is_ai && this.curExp.traffic === 0) {
      return this.checkTraffic();
    }

    this.modal
      .confirm()
      .message(`确定要运行试验吗？将对线上用户生效。`)
      .cancelBtn("取消")
      .okBtn("确认")
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {
            this.changeStatus(this.vs.Run);
          },
          (err) => {}
        );
      });
  }

  hasSameUrl() {
    const curMatchInfo = JSON.parse(this.curExp.control.annotation["urls"])[0];
    const mode = curMatchInfo["mode"];

    if (mode === "equal") {
      return this.equalCompare(curMatchInfo["url"], this.allURLMatch);
    }
    if (mode === "regex") {
      return this.regexpCompare(curMatchInfo["regexp"], this.allURLMatch);
    }
    if (mode === "jsregexp") {
      return this.jsregexpCompare(curMatchInfo["regexp"], this.allURLMatch);
    }
  }

  clearParams(url) {
    const index = url.indexOf("?");
    if (index > -1) {
      return url.substr(0, index);
    } else {
      return url;
    }
  }

  equalCompare(url, ary) {
    const result = ary.map((exp) => {
      const data = exp["control"]["annotation"]["urls"];
      const item = JSON.parse(data)[0];
      if (item["mode"] === "equal") {
        return this.clearParams(item["url"]) === this.clearParams(url);
      }
      if (item["mode"] === "regex") {
        return new RegExp(
          item["regexp"].replace("?", "\\?").replace(/\*/g, "\\S*") + "$"
        ).test(url);
      }
      if (item["mode"] === "jsregexp") {
        return new RegExp(item["regexp"]).test(url);
      }
      return false;
    });

    return result.indexOf(true) > -1;
  }

  regexpCompare(regexp, ary) {
    const reg = new RegExp(
      regexp.replace("?", "\\?").replace(/\*/g, "\\S*") + "$"
    );
    const result = ary.map((exp) => {
      if (
        !exp["control"] ||
        !exp["control"]["annotation"] ||
        !exp["control"]["annotation"]["urls"]
      ) {
        return false;
      }
      const data = exp["control"]["annotation"]["urls"];
      const item = JSON.parse(data)[0];
      return reg.test(item["url"]);
    });
    return result.indexOf(true) > -1;
  }

  jsregexpCompare(jsregexp, ary) {
    const reg = new RegExp(jsregexp);
    const result = ary.map((exp) => {
      if (
        !exp["control"] ||
        !exp["control"]["annotation"] ||
        !exp["control"]["annotation"]["urls"]
      ) {
        return false;
      }
      const data = exp["control"]["annotation"]["urls"];
      const item = JSON.parse(data)[0];
      return reg.test(item["url"]);
    });
    return result.indexOf(true) > -1;
  }

  isSameFlag() {
    let othesLayerExps = [];
    const othesflags = [];
    let isError = false;
    if (this.curExp.layer_id) {
      othesLayerExps = this.exps.filter(
        (e) =>
          e.layer_id !== this.curExp.layer_id &&
          e.typ === VersionTyp.EXP_TYPE_CODE &&
          e.status === VersionStatus.Run
      );
    } else {
      othesLayerExps = this.exps.filter(
        (e) =>
          e.layer_id &&
          e.typ === VersionTyp.EXP_TYPE_CODE &&
          e.status === VersionStatus.Run
      );
    }
    othesLayerExps.forEach((e) => {
      othesflags.push(...Object.keys(e.control.flags));
    });
    othesflags.includes(Object.keys(this.curExp.control.flags)[0])
      ? (isError = true)
      : (isError = false);
    return isError;
  }

  stopExp() {
    this.modal
      .confirm()
      .message(`确定立刻结束试验？将停止分流和数据统计。`)
      .cancelBtn("取消")
      .okBtn("确认")
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {
            this.changeStatus(this.vs.Stop);
          },
          (err) => {}
        );
      });
  }

  checkTraffic() {
    this.modal
      .confirm()
      .message(`不可运行试验！还未分配试验流量。`)
      .cancelBtn("取消")
      .okBtn("确认")
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {},
          (err) => {}
        );
      });
  }

  changeStatus(status) {
    const allVersion = this.versions;
    allVersion.map((v) => {
      v.status = status;
      if (status === this.vs.Stop) {
        v.traffic = 0;
      }
    });

    this.apiExp
      .updateExpWithVersions(this.curExp.id, allVersion, this.curExp)
      .then((res) => {
        const exp = res as Experiment;
        this.curApp.$curExp.next(exp);
        this.exp$.next(exp);
      });
  }

  translateMsg(key, num) {
    return this.translate.get(key, { day: num });
  }

  aiSwitch() {
    if (this.isAi && this.curExp.status === VersionStatus.Run) {
      this.closeAi();
    } else if (
      (this.curExp.status === VersionStatus.Default ||
        this.curExp.status === VersionStatus.Run) &&
      !this.curExp.is_ai
    ) {
      if (this.isExistCurrentLayerAiExperiment(this.curExp.control.layer_id)) {
        this.checkAi();
        return false;
      }
      this.selectAiStat();
    } else if (
      this.curExp.status === VersionStatus.Default &&
      this.curExp.is_ai
    ) {
      this.curExp.is_ai = false;
      this.apiExp.updateExp(this.curExp.id, this.curExp).then((expp) => {
        this.curExp.ai_stat_key = "";
        this.exp$.next(new Experiment(expp));
      });
    }
    return false;
  }

  closeAi() {
    const self = this;
    const dic = this.translate.instant([
      "modal.cancel",
      "modal.ok",
      "operation.aiclose",
    ]);
    this.modal
      .confirm()
      .message(dic["operation.aiclose"])
      .cancelBtn(dic["modal.cancel"])
      .okBtn(dic["modal.ok"])
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {
            this.curExp.is_ai = false;
            this.curExp.ai_stat_key = "";
            this.apiExp.updateExp(this.curExp.id, this.curExp).then((expp) => {
              this.exp$.next(new Experiment(expp));
            });
          },
          (err) => {
            this.isAi = true;
            this.exp$.next(this.curExp);
          }
        );
      });
  }

  checkAi() {
    const self = this;
    const dic = this.translate.instant([
      "modal.cancel",
      "modal.ok",
      "operation.aicheck",
    ]);
    this.modal
      .confirm()
      .message(dic["operation.aicheck"])
      .cancelBtn(dic["modal.cancel"])
      .okBtn(dic["modal.ok"])
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {},
          (err) => {}
        );
      });
  }

  selectAiStat() {
    const dialogRef = this.dialog.open(AiStatSelectDialogComponent, {
      data: {
        exp: this.curExp,
        traffic: this.elseTraffic,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        if (!this.curExp.is_ai) {
          this.isAi = false;
        }
      } else {
        this.exp$.next(result);
      }
    });
  }

  isExistCurrentLayerAiExperiment(layer: string) {
    const fexps = this.exps.filter(
      (exp) => (exp as Experiment).layer_id === layer
    );
    if (!fexps) {
      return false;
    }
    const result = fexps.find(
      (item) => item.is_ai && item.status === VersionStatus.Run
    );
    return result ? true : false;
  }

  modifyAiStat() {
    this.selectAiStat();
  }

  // fix slide toggle disabled touch
  aidrap(e) {
    e.source.toggle();
  }

  showId(version: Version) {
    const qrcode = version.qr_code;
    const clientId = this.ab.getGenerateId();

    this.dialog.open(ExpIdDialogComponent, {
      data: {
        thisVersion: version.name,
        thisClientId: version.id,
      },
    });
  }
}
