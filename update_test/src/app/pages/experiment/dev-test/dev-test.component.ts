import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiExperiment, ApiData } from "adhoc-api";
import {
  Experiment,
  App,
  AppType,
  Version,
  VersionTyp,
  Stat,
  APP_TYPE_IOS,
  APP_TYPE_ANDROID,
  APP_TYPE_WX,
} from "../../../model";
import { CurAppService } from "../../../service/cur-app.service";
import { ABService } from "../../../service/ab.service";
import { DevtestCpIdDialogComponent } from "../../../components/devtest-cp-id-dialog/devtest-cp-id-dialog.component";
import { Observable } from "rxjs";
import { merge } from "rxjs";
import {
  map,
  debounceTime,
  distinctUntilChanged,
  flatMap,
  delay,
} from "rxjs/operators";
import { forkJoin, of } from "rxjs";
import { AbLodash } from "../../../service/ab-lodash.service";
import { Subject } from "rxjs";
import { addParamsToURL } from "../../../utils/url";
import { MatDialog } from "@angular/material";
import { AuthGuard } from "../../../system/auth-guard.service";

@Component({
  selector: "app-dev-test",
  templateUrl: "./dev-test.component.html",
  styleUrls: ["./dev-test.component.scss"],
})
export class DevTestComponent implements OnInit {
  expid: string;
  curExp: Experiment;
  versions: Array<Version>;
  selectVersion: Version;
  curApp: App;
  stats: Array<string>;
  comStats: Array<Stat>;
  public keyUp = new Subject<string>();

  vtp = VersionTyp;
  ap = AppType;
  ifShowBtn = false;

  indexByStat: Object;
  clientResult: Array<Object>;

  dataTable: Array<Object>;

  base_url: string;
  preview_url: string;
  curForceClientId: string;

  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;
  APP_TYPE_WX = APP_TYPE_WX;

  constructor(
    private route: ActivatedRoute,
    curAppService: CurAppService,
    private apiData: ApiData,
    private _: AbLodash,
    private ab: ABService,
    private apiExp: ApiExperiment,
    public dialog: MatDialog
  ) {
    this.curApp = curAppService.getApp();
  }

  async ngOnInit() {
    this.expid = this.route.snapshot.parent.params["id"];
    const exp = await this.apiExp.getExpById(this.expid);

    if (exp.typ == this.vtp.EXP_TYPE_CODE) {
      this.ifShowBtn = true;
    }
    this.apiData.getStat(this.curApp.id).then((stats) => {
      this.curExp = exp as Experiment;
      this.versions = this.curExp.getVersions();
      // filter stats
      this.stats = this.curExp.control.stats;
      this.stats = this.stats.filter((key) => {
        if (!key) {
          return false;
        }
        return !key.startsWith("Event-");
      });
      this.comStats = stats.filter((stat) => stat.isComStat());
      this.stats = this.stats.filter((key) => {
        return this.comStats.find((comstat) => comstat.name === key)
          ? false
          : true;
      });

      // rander data
      this.switchVersion(this.versions[0]);
      this.makeTestDataTable();
    });

    const subscription = this.keyUp
      .pipe(
        map((event) => event["target"].value),
        debounceTime(1000),
        distinctUntilChanged(),
        flatMap((search) => of(search).pipe(delay(500)))
      )
      .subscribe((val) => {
        this.updateCodeExpPreviewURL(val);
      });
  }

  switchVersion(v: Version) {
    this.selectVersion = v;
    this.initPreviewURL(v);
    this.preview_url = this.getExpPreviewImg();
  }

  refresh() {
    this.makeTestDataTable();
  }

  makeTestDataTable() {
    const ob$ = Promise.all([
      this.apiData
        .getClientResult(this.curApp.id)
        .then((res) => res["clients"]),
      this.apiData.getStatResult(this.curApp.id).then((res) => res["results"]),
    ]);
    ob$.then((results) => {
      this.clientResult = results[0];
      this.indexByStat = this._.groupBy(results[1] || [], "stat_key");
    });
  }

  getDebugDataByStat(statName) {
    if (!this.indexByStat) {
      return "landing..";
    }
    const statResult = this.indexByStat[statName];
    if (!statResult) {
      return 0;
    }
    const item = (statResult as Array<Object>).find(
      (item) => item["experiment_id"] === "debug-" + this.selectVersion.id
    );
    return item ? item["sum"] : 0;
  }

  getDebugDataByClient() {
    if (!this.clientResult) {
      return "landing...";
    }
    const i = this.clientResult.find(
      (item) => item["experiment_id"] === "debug-" + this.selectVersion.id
    );
    return i ? i["client_sum"] : 0;
  }

  initPreviewURL(v: Version) {
    if (
      this.curApp.typ === AppType.H5 &&
      this.curExp.typ === VersionTyp.EXP_TYPE_URL
    ) {
      this.base_url = this.curExp.control.annotation["base_url"];
    }
    if (
      this.curApp.typ === AppType.H5 &&
      this.curExp.typ === VersionTyp.EXP_TYPE_BUILD
    ) {
      this.base_url = JSON.parse(this.curExp.control.annotation["urls"])[0].url;
    }
    if (
      this.curApp.typ === AppType.H5 &&
      this.curExp.typ === VersionTyp.EXP_TYPE_CODE
    ) {
      const isExistURL = this.curExp.annotation.hasOwnProperty("base_url");
      this.base_url = isExistURL ? this.curExp.annotation["base_url"] : 0;
    }
  }

  preview() {
    const tabWindowId = window.open("about:blank", "_blank");
    const qrcode = this.selectVersion.qr_code;
    const clientid = this.ab.getGenerateId();
    const url = addParamsToURL(this.base_url, {
      adhoc_force_client_id: clientid,
    });
    const proxyURL =
      "https://h5.appadhoc.com/redirectURL?url=" + encodeURIComponent(url);

    this.apiExp.forceClients(clientid, qrcode).then(function (res) {
      tabWindowId.location.href = proxyURL;
    });
  }

  createClientID() {
    const qrcode = this.selectVersion.qr_code;
    const clientId = this.ab.getGenerateId();

    this.apiExp.forceClients(clientId, qrcode).then((res) => {
      if (!res["error_code"]) {
        this.dialog.open(DevtestCpIdDialogComponent, {
          data: {
            thisVersion: this.selectVersion.name,
            thisClientId: res["client_id"],
          },
        });
      }
    });
  }

  updateCodeExpPreviewURL(url) {
    this.curExp.annotation["base_url"] = this.base_url;
    this.apiExp.updateExp(this.curExp.id, this.curExp).then((result) => {});
  }

  getExpPreviewImg() {
    let url;
    if (
      this.curApp.typ === AppType.H5 &&
      this.curExp.typ === VersionTyp.EXP_TYPE_BUILD
    ) {
      url = this.base_url;
      if (url) {
        const u = encodeURIComponent(encodeURIComponent(url));
        const time = new Date().getTime();
        return `https://sdk.appadhoc.com/screenshots/web-${this.selectVersion.id}-${u}.png?${time}`;
      }
    }

    if (
      this.curApp.typ === AppType.H5 &&
      this.curExp.typ === VersionTyp.EXP_TYPE_URL
    ) {
      url = this.selectVersion.annotation["base_url"];
      if (url) {
        const u = encodeURIComponent(encodeURIComponent(url));
        const time = new Date().getTime();
        return `https://sdk.appadhoc.com/screenshots/web-${this.curExp.id}-${u}.png?${time}`;
      }
    }
    if (
      this.curApp.typ === AppType.IOS &&
      this.curExp.typ === VersionTyp.EXP_TYPE_BUILD
    ) {
      const time = new Date().getTime();
      return `https://sdk.appadhoc.com/screenshots/ios-${this.selectVersion.id}?${time}`;
    }
    if (
      this.curApp.typ === AppType.ANDROID &&
      this.curExp.typ === VersionTyp.EXP_TYPE_BUILD
    ) {
      const time = new Date().getTime();
      return `https://sdk.appadhoc.com/screenshots/android-${this.selectVersion.id}?${time}`;
    }
    if (
      this.curApp.typ === AppType.IOS &&
      this.curExp.typ === VersionTyp.EXP_TYPE_CODE
    ) {
      const time = new Date().getTime();
      return `https://sdk.appadhoc.com/screenshots/code-ios-${this.selectVersion.id}.png?${time}`;
    }
    if (
      this.curApp.typ === AppType.ANDROID &&
      this.curExp.typ === VersionTyp.EXP_TYPE_CODE
    ) {
      const time = new Date().getTime();
      return `https://sdk.appadhoc.com/screenshots/code-android-${this.selectVersion.id}?${time}`;
    }
  }
}

export const DevTestRouter = {
  path: "devtest",
  canActivate: [AuthGuard],
  component: DevTestComponent,
};
