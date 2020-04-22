import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { ApiData } from "adhoc-api";
import { Role } from "../../model/role";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ExportDimensionDialogComponent } from "../export-dimension-dialog/export-dimension-dialog.component";

import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-dimensions",
  templateUrl: "./dimensions.component.html",
  styleUrls: ["./dimensions.component.scss"],
})
export class DimensionsComponent implements OnInit, OnChanges {
  @Input() appid;
  @Input() exp;
  @Input() curStat;
  @Input() startDate;
  @Input() endDate;
  @Output() queryTable = new EventEmitter();
  @Output() queryCharts = new EventEmitter();
  @Output() cancel = new EventEmitter();

  selectType;
  curSelectType;
  aloneTypes;
  activeAlone;

  values;
  activeValue;

  summaryKeys: Array<Object>;
  customKeys: Array<Object>;
  dimensionsResult: Array<Object>;

  dimensionRole = [Role.dimension];

  constructor(
    private apiData: ApiData,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.initSelect();
  }

  initSelect() {
    this.translate
      .get(["dimension.all", "dimension.custom", "dimension.system"])
      .subscribe((dic) => {
        this.selectType = [
          { text: dic["dimension.all"], id: "all" },
          { text: dic["dimension.custom"], id: "custom" },
          { text: dic["dimension.system"], id: "summary" },
        ];
        this.curSelectType = [Object.assign({}, this.selectType[0])];
      });
  }

  ngOnInit() {
    this.initDimensions();
  }

  initDimensions() {
    this.apiData
      .getAllDimensions(this.appid, this.exp.id, this.curStat)
      .then((result) => {
        this.dimensionsResult = result as Array<Object>;
        this.makeDimensions(this.dimensionsResult);
      });
  }

  getDimensionsKeys(array) {
    if (!array) {
      return new Array<string>();
    }
    const arr = array.reduce((arrlist: Array<string>, o) => {
      const key = Object.keys(o)[0];
      if (arrlist.indexOf(key) === -1) {
        arrlist.push(key);
      }
      return arrlist;
    }, []);
    return arr;
  }

  getDimensionsKeysChinese(keys: Array<string>) {
    if (!keys) {
      return;
    }
    const output = [];
    const indexOfDimensionObj = {
      display_height: "屏幕高度",
      url: "url",
      os_version: "操作系统版本",
      device_model: "设备型号",
      browser: "浏览器",
      display_width: "屏幕宽度",
      country: "国家",
      sdk_api_version: "SDKapi版本",
      device_type: "设备类型",
      locale: "地区",
      os_version_name: "操作系统版本名称",
      browser_version_name: "浏览器版本名称",
      language: "语言",
      device_vendor: "设备厂商",
      sdk_version: "SDK版本",
      brower_engine: "浏览器内核",
      browser_engine: "浏览器内核",
      region_province: "省份",
      referrer: "referrer URL",
      OS: "操作系统",
      browser_version: "浏览器版本",
      region_city: " 城市",
      network_state: "网络类型",
      screen_size: "屏幕密度",
    };

    const nameConvert = function (key, indexOfDimension) {
      const newObj = {};
      if (!key) {
        return newObj;
      }
      // console.log('kkkk',key,indexOfDimensionObj);
      newObj["text"] = indexOfDimension[key]
        ? decodeURIComponent(indexOfDimension[key])
        : decodeURIComponent(key);
      newObj["id"] = key;
      return newObj;
    };

    keys.forEach((d) => {
      if (d === "all") {
        return;
      }
      const dimensionObj = nameConvert(d, indexOfDimensionObj);
      output.push(dimensionObj);
    });
    return output;
  }

  makeDimensions(data) {
    const sumary = data.summary;
    const custom = data.custom;
    // index data
    this.customKeys = this.getDimensionsKeysChinese(
      this.getDimensionsKeys(custom)
    );
    this.summaryKeys = this.getDimensionsKeysChinese(
      this.getDimensionsKeys(sumary)
    );
  }

  makeValues(key) {
    const activeTyp = this.curSelectType[0].id;

    const arr = this.dimensionsResult[activeTyp] as Array<Object>;

    const res = arr
      .filter((item) => {
        return item.hasOwnProperty(key);
      })
      .reduce((list: Array<Object>, i) => {
        if (i[key]) {
          list.push({
            id: decodeURIComponent(i[key]),
            text: decodeURIComponent(i[key]),
          });
        }
        return list;
      }, []);
    this.values = res;
    if (this.values) {
      this.activeValue = [Object.assign({}, this.values[0])];
      this.switchValue(this.values[0]);
    }
  }

  switchDimansionsType(e) {
    this.aloneTypes = [];
    this.values = [];

    this.curSelectType = [e];
    const activeTyp = this.curSelectType[0].id;

    if (activeTyp === "summary") {
      this.aloneTypes = this.summaryKeys;
    }

    if (activeTyp === "custom") {
      this.aloneTypes = this.customKeys;
    }

    if (activeTyp === "all") {
      this.cancel.emit();
      return;
    }

    if (!this.aloneTypes.length) {
      return;
    }

    this.activeAlone = [Object.assign({}, this.aloneTypes[0])];
    this.switchAloneType(this.aloneTypes[0]);
  }

  switchAloneType(e) {
    this.activeAlone = [e];
    this.makeValues(e.id);
  }

  ngOnChanges(changes) {
    // if (changes.hasOwnProperty('curStat')) {
    //   this.initSelect();
    //   this.initDimensions();
    // }
    // if (changes.hasOwnProperty('startDate') || changes.hasOwnProperty('endDate')) {
    //   this.query();
    // }
    //时间选择和维度互斥 TODO
    this.initSelect();
    this.initDimensions();
  }

  switchValue(e) {
    this.activeValue = [e];
  }

  queryDimensionsDailyResults(expid, statName, dimension, key, val) {
    this.apiData
      .getStatResultByParam(
        expid,
        this.startDate,
        this.endDate,
        statName,
        "day",
        dimension,
        key,
        val
      )
      .then((res) => {
        this.queryCharts.emit(res);
      });
  }
  queryDimensionsResults(expid, statName, dimension, key, val) {
    // get table data
    this.apiData
      .getTableResultByParam(
        expid,
        this.startDate,
        this.endDate,
        statName,
        "day",
        dimension,
        key,
        val
      )
      .then((res) => {
        this.queryTable.emit(res);
      });
  }

  query() {
    const statName = this.curStat;
    const dimension = this.curSelectType[0].id;
    if (!this.activeAlone || !this.activeValue) {
      return;
    }
    const key = decodeURIComponent(this.activeAlone[0].id);
    const val = this.activeValue[0].id;

    // get charts data
    this.queryDimensionsResults(this.exp.id, statName, dimension, key, val);
    this.queryDimensionsDailyResults(
      this.exp.id,
      statName,
      dimension,
      key,
      val
    );
  }

  exportDialog() {
    const dimension = this.curSelectType[0].id;
    if (!this.activeAlone || !this.activeValue) {
      return;
    }
    const key = decodeURIComponent(this.activeAlone[0].id);
    const val = this.activeValue[0].id;

    const dialogRef = this.dialog.open(ExportDimensionDialogComponent, {
      data: {
        exp: this.exp,
        dimension: dimension,
        key: key,
        val: val,
      },
    });
  }
}
