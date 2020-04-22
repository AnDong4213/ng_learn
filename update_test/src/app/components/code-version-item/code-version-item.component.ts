import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiExperiment } from "adhoc-api";

import { CurAppService } from "../../service/cur-app.service";
import { RoleService } from "../../service/role.service";
import { Version, Role, VersionStatus } from "../../model";
import { MatDialog } from "@angular/material";
import { Subject } from "rxjs";
import { ISubscription } from "rxjs/Subscription";
import { Experiment } from "../../model";
import { CodePushVersionComponent } from "../../components/code-push-version/code-push-version.component";

@Component({
  selector: "[app-code-version-item]",
  templateUrl: "./code-version-item.component.html",
  styleUrls: ["./code-version-item.component.scss"],
})
export class CodeVersionItemComponent implements OnInit, AfterViewInit {
  @Input() version: Version;
  @Input() allversions: Array<Version>;
  @Input() exp$: Subject<Experiment>;
  @Input() index: number;
  @Input() flagkeys: Array<string>;
  @Output() valid = new EventEmitter();
  @Output() ok = new EventEmitter();

  newVersionForm: FormGroup;
  flagVersionForm: FormGroup;
  subscription: ISubscription;
  curExp: Experiment;
  flags: Array<Object>;
  flagKey: string;

  vst = VersionStatus;
  flagtype;
  isFlagValEdit = false;
  isOldExp = false;
  isRole = false;
  publishRole = [Role.publish];

  constructor(
    private fb: FormBuilder,
    private apiExp: ApiExperiment,
    public dialog: MatDialog,
    private curApp: CurAppService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.isOldExp = this.flagkeys && this.flagkeys.length > 1 ? true : false;
    this.roleService.checkRole(Role.flagtyp).then((isRole) => {
      this.isRole = isRole;
    });
    const firstFlagkey = this.flagkeys[0];
    this.flagtype = typeof this.version.flags[firstFlagkey];

    this.newVersionForm = this.fb.group({
      name: [this.version.name, Validators.required],
    });

    this.flagVersionForm = this.fb.group({
      val: ["", Validators.required],
    });

    this.subscription = this.exp$.subscribe((exp) => {
      this.curExp = exp;
    });

    if (this.curExp && this.curExp.status === this.vst.Publish) {
      this.apiExp.getFlags(this.version.app_id).then((res) => {
        this.flags = res;
      });
    }
  }

  clear() {
    this.version.isEdit = false;
    this.newVersionForm.reset();
  }

  save(e, form) {
    e.stopPropagation();
    if (!form.valid) {
      if (this.index < 2 || this.version.id) {
        this.version.isEdit = false;
      } else {
        this.valid.emit(this.version);
      }
      return false;
    }
    this.version.name = this.newVersionForm.controls["name"].value.trim();
    this.version.isEdit = false;

    this.apiExp
      .updateExpWithVersions(this.version.group_id, [this.version])
      .then((res) => {
        this.ok.next(this.version);
      });
  }

  flagSave(e, form, key, index) {
    e.stopPropagation();
    if (!form.valid) {
      if (this.index <= 1 || this.version.id) {
        this.isFlagValEdit = false;
      } else {
        this.isFlagValEdit = false;
      }
      return false;
    }
    this.version.flags[key] = this.flagVersionForm.controls["val"].value.trim();
    if (this.flagtype === "number") {
      this.version.flags[key] = Number(
        this.flagVersionForm.controls["val"].value
      );
    }
    this.isFlagValEdit = false;
    if (this.version.id) {
      this.apiExp
        .updateExpWithVersions(this.version.group_id, [this.version])
        .then((res) => {
          this.ok.next(this.version);
        });
    } else {
      this.ok.next(this.version);
    }
  }

  edit() {
    this.version.isEdit = true;
  }

  flagEdit() {
    this.isFlagValEdit = true;
  }

  ngAfterViewInit() {}

  getFlagVal(key, index) {
    if (!this.version || !this.version.flags) {
      return index;
    }
    const result =
      this.version.flags[key] !== "undefined" ? this.version.flags[key] : index;
    // 临时处理方案
    //return result === 0 && index > 0 ? index : result;d

    return result;
  }

  getFlagValType(key, index) {
    return typeof this.getFlagVal(key, index);
  }

  pushVersion(version) {
    this.flagKey = Object.keys(this.curExp.control.flags)[0];
    const flagValSel = version.flags[this.flagKey];
    const diaRef = this.dialog.open(CodePushVersionComponent, {
      data: {
        exp: this.exp$,
      },
    });

    diaRef.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return;
      }
      this.changeStatus(this.vst.Publish);
      this.updateFlag(flagValSel);
    });
  }

  ifPushed(version) {
    const versionFlagName = Object.keys(version["flags"])[0];
    const versionFlagVal = Object.values(version["flags"])[0];

    if (!this.flags) {
      return "loading...";
    }
    const f = this.flags.find((flag) => flag["name"] === versionFlagName);

    if (versionFlagVal == f["default_value"]) {
      return true;
    }
  }

  mgOnDestory() {
    this.subscription.unsubscribe();
  }

  changeStatus(status) {
    const allVersion = this.allversions;
    allVersion.map((v) => {
      v.status = status;

      if (status === this.vst.Publish) {
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

  updateFlag(flagVal) {
    const flagKey = Object.keys(this.curExp.control.flags)[0];

    const flagObj = {
      name: flagKey,
      description: "",
      typ: 0,
      default_value: flagVal,
    };
    this.apiExp.updateFlag(
      this.version.app_id,
      encodeURIComponent(flagObj["name"]),
      flagObj
    );
  }
}
