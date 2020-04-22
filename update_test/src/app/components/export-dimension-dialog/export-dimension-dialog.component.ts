import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Inject,
} from "@angular/core";
import { IMyDrpOptions, IMyDateRangeModel, IMyDate } from "mydaterangepicker";

import { Experiment, VersionStatus } from "../../model";
import { ApiData } from "adhoc-api";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-export-dimension-dialog",
  templateUrl: "./export-dimension-dialog.component.html",
  styleUrls: ["./export-dimension-dialog.component.scss"],
})
export class ExportDimensionDialogComponent implements OnInit {
  exp: Experiment;
  dimension;
  key;
  val;

  options: IMyDrpOptions;
  model;

  startDate: Date;
  endDate: Date;
  downloadURL;
  isError;

  constructor(
    private apiData: ApiData,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ExportDimensionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.options = {
      dateFormat: "yyyy-mm-dd",
      showClearBtn: false,
      showClearDateRangeBtn: false,
    };

    this.translate
      .get([
        "dateRange.beginTxt",
        "dateRange.endTxt",
        "dateRange.su",
        "dateRange.mo",
        "dateRange.tu",
        "dateRange.we",
        "dateRange.th",
        "dateRange.fr",
        "dateRange.sa",
        "dateRange.jan",
        "dateRange.feb",
        "dateRange.mar",
        "dateRange.apr",
        "dateRange.may",
        "dateRange.jun",
        "dateRange.jul",
        "dateRange.aug",
        "dateRange.sep",
        "dateRange.oct",
        "dateRange.nov",
        "dateRange.dec",
      ])
      .subscribe((result) => {
        this.options["selectBeginDateTxt"] = result["dateRange.beginTxt"];
        this.options["selectEndDateTxt"] = result["dateRange.endTxt"];
        this.options["dayLabels"] = {
          su: result["dateRange.su"],
          mo: result["dateRange.mo"],
          tu: result["dateRange.tu"],
          we: result["dateRange.we"],
          th: result["dateRange.th"],
          fr: result["dateRange.fr"],
          sa: result["dateRange.sa"],
        };

        this.options["monthLabels"] = {
          1: result["dateRange.jan"],
          2: result["dateRange.feb"],
          3: result["dateRange.mar"],
          4: result["dateRange.apr"],
          5: result["dateRange.may"],
          6: result["dateRange.jun"],
          7: result["dateRange.jul"],
          8: result["dateRange.aug"],
          9: result["dateRange.sep"],
          10: result["dateRange.oct"],
          11: result["dateRange.nov"],
          12: result["dateRange.dec"],
        };
      });
  }

  ngOnInit() {
    this.exp = this.data.exp;
    this.dimension = this.data.dimension;
    this.key = this.data.key;
    this.val = this.data.val;

    this.initDataRangeByExp(this.exp);
    this.initDisableDate(this.exp);
  }

  initDataRangeByExp(exp) {
    this.startDate = new Date(exp.control.start_date * 1000);
    this.endDate =
      exp.control.status === VersionStatus.Stop
        ? new Date(exp.control.end_date * 1000)
        : new Date();
  }

  initDisableDate(exp) {
    this.options.disableUntil = {
      year: this.startDate.getFullYear(),
      month: this.startDate.getMonth() + 1,
      day: this.startDate.getDate() - 1,
    };
    this.options.disableSince = {
      year: this.endDate.getFullYear(),
      month: this.endDate.getMonth() + 1,
      day: this.endDate.getDate() + 1,
    };
  }

  dateChange(e: IMyDateRangeModel) {
    this.startDate = e.beginJsDate;
    this.endDate = e.endJsDate;
    this.getCSV();
  }

  getCSV() {
    this.startDate.setHours(0);
    this.startDate.setMinutes(0);
    this.endDate.setHours(23);
    this.endDate.setMinutes(60);
    this.apiData
      .exportDimensionData(
        this.startDate,
        this.endDate,
        this.exp.id,
        this.dimension,
        this.key,
        this.val
      )
      .then(
        (url) => {
          this.downloadURL = url;
          this.isError = false;
        },
        (err) => {
          this.isError = true;
        }
      );
  }
}
