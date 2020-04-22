import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CurAppService } from "../../service/cur-app.service";
import { CurExpService } from "../../service/cur-exp.service";
import { ApiExperiment, ApiData } from "adhoc-api";
import {
  Experiment,
  Layer,
  App,
  StatusDict,
  VersionStatus,
  VersionTyp,
  APP_TYPE_WX,
} from "../../model";
import { AuthGuard } from "../../system/auth-guard.service";
import { map } from "rxjs/operators";
import { tap } from "rxjs/operators";
import "rxjs/add/operator/do";
import { fromPromise } from "rxjs/observable/fromPromise";

import { ExpTypSelectDialogComponent } from "../../components/exp-typ-select-dialog/exp-typ-select-dialog.component";

import { overlayConfigFactory } from "ngx-modialog";
import { ToastrService } from "ngx-toastr";
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
import { Subject } from "rxjs";
import { ExperimentCloneComponent } from "../../components/experiment-clone/experiment-clone.component";

import { TranslateService } from "@ngx-translate/core";
import { StickyDirection } from "@angular/cdk/table";

@Component({
  selector: "app-experiment-list",
  templateUrl: "./experiment-list.component.html",
  styleUrls: ["./experiment-list.component.scss"],
})
export class ExperimentListComponent implements OnInit {
  private exps: Array<Experiment>;
  expResults$: Subject<object>;
  expResults: Array<Experiment>;
  lastVaildExp = new Array<Object>();
  expStatusDist = StatusDict;
  expStatus = VersionStatus;
  theme: VEXBuiltInThemes = <VEXBuiltInThemes>"default";
  layers: Array<Layer>;
  app: App;
  thisName;
  isExistExp = false;
  ifHasBestVersion: Boolean = false;
  curApp$;
  flagsAry;
  loading = true;
  versionTyp = VersionTyp;
  APP_TYPE_WX = APP_TYPE_WX;

  expTyp: string = "all";

  searchTerm = "";

  isChecked;
  checkExps: Object; // { expid : ischeck }
  cloneExp: Experiment;
  keyStatsAry: Array<Object>;
  bestVersionAry: Array<Object>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private curApp: CurAppService,
    private apiExp: ApiExperiment,
    private apiData: ApiData,
    public modal: Modal,
    private curExp: CurExpService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    public dialog: MatDialog
  ) {
    this.checkExps = {};
    this.bestVersionAry = [];
    this.expResults$ = new Subject<Experiment>();
    this.expResults$.subscribe((exp: Experiment) => {
      // 如果在克隆页面选择了新建层，就需要更新当前组建的layer集合
      if (exp.control.hasOwnProperty("layer_id")) {
        this.getLayerDict(this.app.id);
      }
      this.expResults.unshift(exp as Experiment);
    });
  }

  ngOnInit() {
    this.curApp$ = this.curApp.getApp$();
    this.curApp$.subscribe((app) => {
      this.app = this.curApp.getApp();

      this.getExperiments(this.app.id);
      this.getLayerDict(this.app.id);
      this.getFlagAry(this.app.id);
    });

    this.app = this.curApp.getApp();
    if (!this.app) {
      return this.router.navigate(["/app_manage"]);
    } else {
      this.curApp$.next(this.app);
    }
  }

  getExperiments(appid) {
    fromPromise(this.apiExp.getAllExperiments(appid))
      .pipe(tap((re) => (this.loading = false)))
      .toPromise()
      .then((exps) => {
        this.exps = exps as Experiment[];
        this.expResults = exps as Experiment[];
        this.isExistExp = this.exps.length > 0 ? true : false;

        this.apiData.getAllKeyStat(this.app.id).then((res) => {
          if (res["error_code"]) {
            return;
          }
          this.keyStatsAry = res["result"].filter(
            (item) => item["indicators"] != ""
          );
          this.getExpHasStat();
        });
      });
  }

  getExpHasStat() {
    if (this.exps && this.exps.length != 0) {
      const filterExp = this.exps.filter(
        (exp) =>
          exp.status === this.expStatus.Stop ||
          exp.status === this.expStatus.Run
      );
      filterExp.map((exp) => this.getFilteExp(exp));

      this.lastVaildExp.map((item) => this.getMetricsResult(item));
    }
  }

  getFilteExp(exp) {
    this.keyStatsAry.filter((stat) => {
      if (stat["group_id"] === exp["id"]) {
        this.lastVaildExp.push({
          exp: exp,
          groupId: stat["group_id"],
          indicator: stat["indicators"],
        });
      }
    });
  }

  /**
   * 获取试验分组下，指标详情报表数据
   */
  getMetricsResult(item) {
    let endDate =
      item.exp.status === this.expStatus.Stop
        ? new Date(item.exp.control.end_date)
        : item.exp.status === this.expStatus.Run
        ? new Date()
        : null;

    this.apiData
      .getTableResultByParam(
        item.exp.id,
        new Date(item.exp.control.start_date),
        endDate,
        item.indicator,
        "day"
      )
      .then((dataInfo) => {
        this.theBestVersionCalc(dataInfo, item.exp.id, item.indicator);
      });
  }

  /**
   * 计算最优版本
   */
  theBestVersionCalc(info, thisExpId, thisKeyStat) {
    let bestVersion = "";
    const calcExps = info.filter((item, index) => index != 0);
    const originExpHigh = info[0].mean_ci_high;
    const originExpLow = info[0].mean_ci_low;

    const ifAllM = calcExps.every(
      (item) => item.mean_ci_high < 0 && item.mean_ci_low < 0
    );
    const ifAllP = calcExps.every(
      (item) => item.mean_ci_high > 0 && item.mean_ci_low > 0
    );
    const ifAllDAry = calcExps.filter((item) => {
      if (
        (item.mean_ci_high > 0 && item.mean_ci_low > 0) ||
        (item.mean_ci_high < 0 && item.mean_ci_low < 0)
      ) {
        return item;
      }
    });
    const ifAllZero = calcExps.every(
      (item) => item.mean_ci_high === 0 && item.mean_ci_low === 0
    );

    if (ifAllZero && originExpHigh === 0 && originExpLow === 0) {
      bestVersion = "";
    } else if (ifAllM) {
      bestVersion = info[0].exp_name;
    } else if (ifAllP) {
      const expPercent = calcExps.sort((a, b) => a.mean - b.mean);
      bestVersion = expPercent[0].exp_name;
    } else if (ifAllDAry.length != 0) {
      bestVersion = ifAllDAry.reduce((item1, item2) => {
        return item1.mean_variant > item2.mean_variant
          ? item1.mean_variant
          : item2.mean_variant;
      }).exp_name;
    } else {
      bestVersion = "";
    }
    if (bestVersion != "") {
      let indexInExps;
      info.map((item, index) => {
        if (item["exp_name"] === bestVersion) {
          indexInExps = index;
        }
      });
      this.bestVersionAry.push({
        expid: thisExpId,
        keystat: thisKeyStat,
        bestversion: bestVersion,
        index: indexInExps,
      });
    }
  }

  getDotColor(exp) {
    let thisIndex;
    if (this.bestVersionAry.length != 0) {
      this.bestVersionAry.map((item) => {
        if (exp["id"] === item["expid"]) {
          thisIndex = item["index"];
        }
      });

      return thisIndex;
    } else {
      return null;
    }
  }

  getkeyStat(exp) {
    if (this.bestVersionAry.length != 0) {
      var thisVersionItem = this.bestVersionAry.filter((item) => {
        return exp.id === item["expid"];
      })[0];
    }
    if (thisVersionItem) {
      return thisVersionItem["keystat"];
    } else {
      return null;
    }
  }
  getbestversion(exp) {
    if (this.bestVersionAry.length != 0) {
      var thisVersionItem = this.bestVersionAry.filter((item) => {
        return exp.id === item["expid"];
      })[0];
    }

    if (thisVersionItem) {
      if (thisVersionItem["bestversion"] != "") {
        return thisVersionItem["bestversion"];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  ifShowThis(exp) {
    if (this.bestVersionAry.length != 0) {
      var thisVersionItem = this.bestVersionAry.filter((item) => {
        return exp.id === item["expid"];
      })[0];

      if (thisVersionItem) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  newExperiment() {
    const dialogRef = this.dialog.open(ExpTypSelectDialogComponent);
  }

  getLayerDict(appid: string) {
    this.apiExp
      .getLayersByAppId(appid)
      .then((layers) => (this.layers = layers));
  }
  getFlagAry(appid: string) {
    this.apiExp.getFlags(appid).then((res) => (this.flagsAry = res));
  }

  getLayerNameByLayerId(layerid) {
    if (!this.layers) {
      return "loading...";
    }
    const l = this.layers.find((layer) => layer.id === layerid);
    return l ? l.name : this.translate.instant("explist.默认层");
  }

  delConfirm(exp: Experiment) {
    this.modal
      .confirm()
      .message(`确认要删除 [${exp.name}] 吗?`)
      .cancelBtn("取消")
      .okBtn("确认")
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result
          .then((r) => {
            this.delExp(exp);
          })
          .catch((err) => {});
      })
      .catch((err) => {});
  }

  delExp(exp: Experiment) {
    this.apiExp.delExp(exp.id).then((res) => {
      if (res["error_code"] !== 0) {
        return console.log("del remove fail");
      }
      const index = this.exps.indexOf(exp, 0);
      if (index > -1) {
        this.exps.splice(index, 1);
        this.expResults = this.exps;

        const allVersion = exp.getVersions();
        allVersion.map((v) => {
          v.traffic = 0;
        });
        this.apiExp
          .updateExpWithVersions(exp.id, allVersion, exp)
          .then((res) => {});

        console.log("remove success");
      } else {
        console.log("del remove fial");
      }
    });
  }

  selectTyp(typ) {
    this.expTyp = typ;

    this.expResults = this.exps.filter((exp) => {
      if (typ === "all") {
        return true;
      }
      return exp.status === typ;
    });
  }

  search() {
    this.expResults = this.exps.filter((exp) => {
      if (!this.searchTerm) {
        return true;
      }
      return exp.name.indexOf(this.searchTerm) > -1;
    });
  }

  goDataPage(exp: Experiment) {
    this.curExp.setCurExp(exp);
    const pageName =
      exp.status === VersionStatus.Run || exp.status === VersionStatus.Stop
        ? "data"
        : "setting";
    this.router.navigate(["/exp", exp.id, pageName]);
  }

  selectAllExp(e) {
    this.isChecked = e.target.checked;
    this.checkExps = this.expResults.reduce(
      (array: Object, exp: Experiment) => {
        if (exp.status !== VersionStatus.Run) {
          if (this.isChecked) {
            array[exp.id] = this.isChecked;
          } else {
            delete array[exp.id];
          }
        }
        return array;
      },
      {}
    );
  }

  changeItemChecked(e, exp) {
    const isCheckd = e.target.checked;
    if (isCheckd) {
      this.checkExps[exp.id] = true;
      const ids = Object.keys(this.checkExps);
      if (ids) {
        this.isChecked = true;
      } else {
        this.isChecked = false;
      }
    } else {
      delete this.checkExps[exp.id];
    }
  }

  isCheckdExp(exp) {
    return this.checkExps.hasOwnProperty(exp.id)
      ? this.checkExps[exp.id]
      : false;
  }

  deleteSelect() {
    const ids = Object.keys(this.checkExps);
    (ids || []).forEach((id) => {
      this.apiExp.delExp(id).then((res) => {
        const index = this.expResults.findIndex((exp) => exp.id === id);
        if (index > -1) {
          this.expResults.splice(index, 1);
        }
        const n = this.exps.findIndex((exp) => exp.id === id);
        if (n > -1) {
          this.exps.splice(n, 1);
        }
      });
    });
    this.isChecked = false;
  }

  deleteAlert() {
    const txt = this.translate.instant("explist.alldel");
    this.confireDialog(txt).then((resultPromise) => {
      return resultPromise.result.then(
        (r) => {
          this.deleteSelect();
        },
        (err) => {}
      );
    });
  }

  confireDialog(strmsg: string) {
    const dic = this.translate.instant(["modal.cancel", "modal.ok"]);
    return this.modal
      .confirm()
      .message(strmsg)
      .cancelBtn(dic["modal.cancel"])
      .okBtn(dic["modal.ok"])
      .showCloseButton(false)
      .open();
  }

  clip(e) {
    const txt = this.translate.instant("explist.copy");
    this.toastrService.success(txt);
  }

  clone(exp) {
    this.cloneExp = exp as Experiment;

    const dialogRef = this.dialog.open(ExperimentCloneComponent, {
      data: { cloneExp: this.cloneExp, expResults$: this.expResults$ },
    });
  }

  translateMsg(key, date) {
    return this.translate.get(key, { date: date });
  }

  getPublishVersionName(exp) {
    const flagsName = Object.keys(exp.control.flags)[0];

    if (!this.flagsAry) {
      return "loading...";
    }

    const f = this.flagsAry.find((flag) => flag["name"] === flagsName);
    const e = exp.experiments.find(
      (exp) => f["default_value"] === Object.values(exp.flags)[0]
    );
    if (!e) {
      return "";
    }

    return e.name;
  }
}

export const ExperimentListRouter = {
  path: "",
  component: ExperimentListComponent,
  canActivate: [AuthGuard],
};
