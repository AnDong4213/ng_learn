import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Inject,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import {
  Version,
  App,
  Layer,
  Experiment,
  VersionStatus,
  AppType,
  VersionTyp,
} from "../../model";
import { ApiExperiment, ApiH5, ApiData } from "adhoc-api";
import { CurAppService } from "../../service/cur-app.service";

import { ToastrService } from "ngx-toastr";

import { Observable, forkJoin } from "rxjs";
import { Subject } from "rxjs";
import {
  ExpNamelValidator,
  CheckRepeatValidator,
} from "../../utils/validators";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Role } from "../../model/role";

import { TranslateService } from "@ngx-translate/core";

import { map } from "rxjs/operators";

@Component({
  selector: "app-experiment-clone",
  templateUrl: "./experiment-clone.component.html",
  styleUrls: ["./experiment-clone.component.scss"],
})
export class ExperimentCloneComponent implements OnInit {
  expResults$: Subject<Experiment>;
  cloneExp;
  cloneForm: FormGroup;
  isSubmit = false;
  lock = false;

  curApp: App;
  newExp: Experiment;

  layers: Array<Layer>;
  layers$;
  layerItems: Array<Object>;
  activeLayer = { id: "", text: "" };
  expNames = [];
  layerRole: Array<any>;
  appType = AppType;
  versionTyp = VersionTyp;

  thisKeyStat: string;

  createLock = true;

  constructor(
    private fb: FormBuilder,
    private apiExp: ApiExperiment,
    private apiData: ApiData,
    private curAppService: CurAppService,
    private toast: ToastrService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ExperimentCloneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.layers = new Array<Layer>();
    this.newExp = new Experiment();
    this.layerRole = [Role.layer];
  }

  ngOnInit() {
    this.cloneExp = this.data.cloneExp;
    this.expResults$ = this.data.expResults$;

    // 找到原试验的关键指标
    this.apiData.getKeyStat(this.cloneExp.id).then((res) => {
      if (res.hasOwnProperty("error_code")) {
        return;
      }
      this.thisKeyStat = res["result"].indicators;
    });

    this.initFormGroups();
    this.curApp = this.curAppService.getApp();
    this.apiExp.getAllExpNames(this.curApp.id).then((res) => {
      this.expNames = res as Array<any>;
      this.initFormGroups();
    });
    this.getAllLayers();
    this.setLayer();
  }

  cloneFormSubmit(form) {
    this.isSubmit = true;
    if (!form.valid) {
      return false;
    }

    const values = form.value;
    const layerResult = this.layers.find((l) => l["id"] === values["layer_id"]);
    Object.assign(this.newExp, this.cloneExp);

    delete this.newExp["id"];
    delete this.newExp["app_id"];
    this.newExp.status = VersionStatus.Default;
    this.newExp.name = values["name"];
    delete this.newExp["is_ai"];
    delete this.newExp["ai_stat_key"];

    this.newExp.control.status = VersionStatus.Default;
    this.newExp.control.traffic = 0;
    delete this.newExp.control["group_id"];
    delete this.newExp.control["id"];
    delete this.newExp.control["app_id"];

    this.newExp.experiments.map((item) => {
      delete item["id"];
      delete item["app_id"];
      delete item["group_id"];
      item.status = VersionStatus.Default;
      item.traffic = 0;
    });

    if (!this.lock) {
      this.lock = true;
      this.asyncExp(layerResult, () => {
        this.dialogRef.close();
        this.lock = false;
      });
    }
  }

  asyncLayer(layer) {
    let ob;
    if (layer["id"] === "new") {
      const layerobj = Object.assign({}, layer);
      layerobj.name = this.generateLayerName();
      ob = this.apiExp.createLayer(this.curApp.id, layerobj);
    } else {
      ob = Observable.create((serve) => {
        serve.next(layer);
        serve.complete();
      });
    }
    return ob;
  }

  asyncExp(layerOpts, callback) {
    const ob = forkJoin([this.asyncLayer(layerOpts)]);

    ob.subscribe((res) => {
      const layer = res[0];
      if (layer["id"] !== "default") {
        this.newExp.setLayerId(layer["id"]);
      } else {
        this.newExp.delLayerId();
      }

      this.apiExp.createExp(this.curApp.id, this.newExp).then((exp) => {
        this.lock = true;
        if (exp.hasOwnProperty("error_code")) {
          this.toast.error(exp["reason_display"]);
          return;
        }
        // 克隆试验创建成功后立刻为该试验创建关键指标
        if (this.thisKeyStat) {
          this.apiData.setKeyStat(exp["id"], this.thisKeyStat).then((res) => {
            if (res.hasOwnProperty("error_code")) {
              this.toast.error(res["reason_display"]);
              return;
            }
          });
        }

        this.expResults$.next(new Experiment(exp));
        return callback();
      });
    });
  }

  generateLayerName(index: number = 1) {
    const layerName = `layer${index}`;
    const rindex = this.layers.findIndex((layer) => layer.name === layerName);
    if (rindex > -1) {
      index++;
      return this.generateLayerName(index);
    } else {
      return layerName;
    }
  }

  // 获取当前app的所有layers
  getAllLayers() {
    this.layers$ = this.apiExp
      .getLayersByAppId(this.curApp.id)
      .then((layers) => {
        const dic = this.translate.instant(["expclone.new", "expclone.def"]);
        layers ? "" : (layers = new Array<Layer>());
        const defaultLayer = new Layer({
          name: dic["expclone.def"],
          id: "default",
        });
        const newLayer = new Layer({
          name: dic["expclone.new"],
          id: "new",
        });

        layers.unshift(defaultLayer);
        layers.push(newLayer);
        return layers;
      });
  }

  setLayer() {
    this.layers$.then((arr) => {
      this.layers = arr;
      this.layerItems = this.layers.reduce((sum, l: Layer) => {
        sum.push({ id: l.id, text: l.name });
        return sum;
      }, []);
      this.activeLayer = Object.assign(this.layerItems[0]);
      this.cloneForm.controls["layer_id"].setValue(this.layerItems[0]["id"]);
    });
  }

  switchLayer(layer) {
    this.activeLayer = layer;
    this.cloneForm.controls["layer_id"].setValue(layer.id);
  }

  initFormGroups() {
    const txt = this.translate.instant("expclone.clone");
    this.cloneForm = this.fb.group({
      name: [
        this.cloneExp.name + "_" + txt,
        Validators.compose([
          Validators.required,
          ExpNamelValidator(),
          CheckRepeatValidator(this.expNames),
        ]),
      ],
      layer_id: ["default"],
    });
  }

  close() {
    this.dialogRef.close();
  }
}
