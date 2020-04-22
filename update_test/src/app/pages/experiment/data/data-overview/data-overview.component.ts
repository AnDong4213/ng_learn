import { Component, OnInit, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import {
  Version,
  Experiment,
  VersionStatus,
  App,
  Flag,
} from "../../../../model";

import { ApiExperiment, ApiData, ApiAuth } from "adhoc-api";
import { AbLodash } from "../../../../service/ab-lodash.service";
import { ABService } from "../../../../service/ab.service";
import { DataBase } from "../base.component";
import { color } from "../echarts.component";
import { CurAppService } from "../../../../service/cur-app.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ExportDialogComponent } from "../../../../components/export-dialog/export-dialog.component";

@Component({
  selector: "app-data-overview",
  templateUrl: "./data-overview.component.html",
  styleUrls: ["./data-overview.component.scss"],
})
export class DataOverviewComponent extends DataBase implements OnInit {
  app: App;
  // ui
  datas: Object = {};

  chartData: Array<Object>;
  qrcodeIndex: Object = {};

  goodVersionId: string;
  statKeys: Array<string>;

  tableData: Array<Object>;

  statAll: Array<Object>;

  pvData: Object;

  STAT_TYPE_UV: String = "uv"; //  转化人数
  STAT_TYPE_UV_MEAN: String = "uv_mean"; // 转化
  STAT_TYPE_SUM: String = "sum"; // 总数
  STAT_TYPE_MEAN: String = "mean"; // 均值

  isEmpty = false;

  indexAllStats: Object;

  stats: Array<Object>; // 普通指标
  comStats: Array<Object>; // 复合指标

  vs = VersionStatus;

  statType: String;
  isLoading = true;
  set styp(val) {
    this.statType = val;
    this.showPageData();
  }

  constructor(
    route: ActivatedRoute,
    apiData: ApiData,
    _: AbLodash,
    ab: ABService,
    apiExp: ApiExperiment,
    curAppService: CurAppService,
    private apiAuth: ApiAuth,
    private curApp: CurAppService,
    public dialog: MatDialog
  ) {
    super(route, apiData, _, ab, curAppService, apiExp);

    this.statType = this.STAT_TYPE_MEAN;
    this.statKeys = new Array<string>();
    this.tableData = new Array<Object>();
    this.chartData = new Array<Object>();
  }

  ngOnInit() {
    super.ngOnInit();
    this.app = this.curApp.getApp();
    this.getExp(() => {
      this.apiData.getStat(this.app.id).then((stats) => {
        this.indexAllStats = this._.keyBy(stats, "name");

        this.statKeys = this.exp.control["stats"];
        this.statKeys = this.statKeys.filter(
          (val) => val && !val.startsWith("Event-")
        );
        // 获取所有指标信息
        this.statKeys.sort((a, b) => {
          if (a.length === b.length) {
            return 0;
          }
          return a.length > b.length ? 1 : -1;
        });
        if (this.statKeys.length <= 0) {
          this.isEmpty = true;
        }
        this.showPageData();
      });
    });
  }

  /**
   * 获取报表和表单数据
   */
  showPageData() {
    this.getMetricsDetail((res) => {
      // 画报表
      this.initChartData(res);
      // 表单
      this.tableData = this.makeTableData(res);
    });
  }

  initChartData(res) {
    this.chartData = [];
    let config = Object();
    config = {
      color: color,
      tooltip: {
        tigger: "item",
        position: ["50%", "50%"],
      },
      grid: {
        left: "5%",
        right: "5%",
        top: "5%",
        bottom: "0",
        width: 280,
        containLabel: true,
      },
      xAxis: {
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          textStyle: {
            color: "#a0a0a0",
          },
        },
        data: [],
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
          interval: 4,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      series: [],
    };

    this.statKeys.map((stat) => {
      const series = [];
      const ldata = [];

      (res[stat] || []).map((r) => {
        const name = r.is_control_version
          ? "原始版本"
          : this._.keyBy(this.exp.experiments, "id")[r.id].name;
        const num = r.is_composite_metric
          ? 0
          : this.statType == this.STAT_TYPE_MEAN
          ? r.mean
          : r.uv_mean;
        series.push({
          name: name,
          type: "bar",
          barMaxWidth: 10,
          barGap: "100%",
          data: [num],
          itemStyle: {
            normal: {
              barBorderRadius: [5, 5, 0, 0],
            },
          },
        });
        ldata.push(name);
      });

      const c = this._.deepCopy(config);
      c.xAxis.data = [stat];
      c.series = series;
      const sum = c.series.reduce((p, val) => {
        return (p += val.data[0]);
      }, 0);
      if (sum > 0) {
        this.chartData.push(c);
      }
    });
  }

  /**
   * 获取普通指标和复合指标
   * @param {[type]}  result_data 试验分组下各个版本的数据
   * @param {Boolean} isComposite false: 普通指标，true: 复合指标
   */
  groupDes(result_data, isComposite) {
    const statsArr = new Array();
    this.statKeys.forEach((val) => {
      if (
        result_data[val] &&
        result_data[val][0].is_composite_metric == isComposite
      ) {
        statsArr.push(result_data[val][0]);
      }
    });
    return statsArr;
  }

  /**
   * 获取对照组或试验组数据
   * @param {[type]} version [description]
   */
  setVersionStatData(version, res) {
    const item = Object();
    item.displayVersionName = version.name;
    item.isControl = version.isControl;
    item.traffic = version.traffic;
    item.des = version.description;
    item.id = version.id;
    this.statKeys.forEach((val) => {
      item[val] = Object();
      let itemData = this._.keyBy(res[val], "id")[version.id];
      if (!itemData) {
        itemData = {
          sum: 0,
          uv: 0,
          mean: 0,
          uv_mean: 0,
          mean_ci_low: 0,
          mean_ci_high: 0,
        };
      }
      // 访客数量
      item.total =
        itemData && !itemData.is_composite_metric ? itemData.sum : item.uv;
      item[val].num =
        this.statType === this.STAT_TYPE_MEAN
          ? itemData.mean.toFixed(3)
          : itemData.uv_mean.toFixed(3);
      item[val].variant = itemData.mean_variant;
      item[val].ci = {
        low: itemData.mean_ci_low,
        high: itemData.mean_ci_high,
      };

      item[val].variantRate = itemData.uv_mean_variant;
      item[val].ciRate = {
        low: itemData.uv_mean_ci_low,
        high: itemData.uv_mean_ci_high,
      };
    });
    return item;
  }

  /**
   * 整理tabledata数据
   * @param {[type]} res 试验分组下，各个版本的指标开始至今的总数据
   */
  makeTableData(res) {
    const tableData = Array<Object>();
    // 将当前试验的指标分为 普通指标stats 和 复合指标comStats
    this.stats = this.groupDes(res, false);
    this.comStats = this.groupDes(res, true);

    const controlItem = this.setVersionStatData(this.exp.control, res); // 计算 普通版本指标数据
    tableData.push(controlItem);

    const pvd = res.hasOwnProperty("Event-GET_EXPERIMENT_FLAGS")
      ? res["Event-GET_EXPERIMENT_FLAGS"]
      : [];
    this.pvData = this._.keyBy(pvd, "id");

    // 计算试验版本的指标（普通指标 + 复合指标）
    this.exp.experiments.forEach((version) => {
      const item = this.setVersionStatData(version, res); // 计算 普通版本指标数据
      tableData.push(item);
    });
    this.isLoading = false;

    return tableData;
  }

  /**
   * 获取试验分组下，各个版本的指标开始至今的总数据，包含复合指标
   * @param {Function} callback [description]
   */
  getMetricsDetail(callback) {
    this.apiData.getMetricsDetailStat(this.exp.id).then((res) => {
      return callback(res);
    });
  }

  exportData() {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      data: { exp: this.exp },
    });
  }

  getComStatFormula(stat) {
    return this.indexAllStats.hasOwnProperty(stat)
      ? this.indexAllStats[stat]["formula"]
      : "";
  }

  getTotalByVersion(v) {
    const data = this.pvData.hasOwnProperty(v.id)
      ? this.pvData[v.id]
      : { sum: 0 };
    return data.sum;
  }

  // 复合指标的置信区间需要一天试验开始后才可以显示
  isFirstDay() {
    const i =
      (Date.now() - this.exp.control.start_date * 1000) / 1000 / 60 / 60 / 24;
    return i < 1;
  }
}
