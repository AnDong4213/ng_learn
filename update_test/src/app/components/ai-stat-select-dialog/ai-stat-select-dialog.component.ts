import { Component, OnInit, Inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ApiData } from "adhoc-api";
import { ApiExperiment } from "adhoc-api";
import { CurAppService } from "../../service/cur-app.service";
import { Experiment } from "../../model/experiment";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-ai-stat-select-dialog",
  templateUrl: "./ai-stat-select-dialog.component.html",
  styleUrls: ["./ai-stat-select-dialog.component.scss"],
})
export class AiStatSelectDialogComponent implements OnInit {
  data = new Array<any>();
  defaultStat = [{ id: "", text: "" }];
  curExp;
  activeStat;
  elseTraffic;

  constructor(
    private translate: TranslateService,
    private apiData: ApiData,
    private apiExp: ApiExperiment,
    private curApp: CurAppService,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    public dialogRef: MatDialogRef<AiStatSelectDialogComponent>
  ) {
    this.curExp = datas.exp;
    this.elseTraffic = datas.traffic;
  }

  async ngOnInit() {
    const app = this.curApp.getApp();

    const stats = await this.apiData.getStat(app.id);
    const txt = this.translate.instant("aidialog.select");
    this.defaultStat[0].text = txt;

    const result = this.curExp.control.stats;
    const arr = [];
    arr.push(Object.assign({}, this.defaultStat[0]));
    result.map((item) => {
      const fresult = (stats || []).find((i) => i.name === item);
      if (fresult && !fresult["formula"]) {
        arr.push({ id: item, text: item });
      }
    });
    this.data = arr;
  }

  switchFilter(active) {
    this.activeStat = active;
  }

  close() {
    this.dialogRef.close();
  }

  ok() {
    this.curExp.is_ai = true;
    this.curExp.ai_stat_key = this.activeStat.text;
    this.curExp.setAvgTraffic(this.elseTraffic);
    const vss = this.curExp.getVersions();
    this.apiExp.updateExpWithVersions(this.curExp.id, vss).then((exp) => {
      this.apiExp.updateExp(this.curExp.id, this.curExp).then((rr) => {
        this.dialogRef.close(new Experiment(rr));
      });
    });
  }
}
