import { Component, OnInit, Input } from '@angular/core';
import { Version, VersionTyp, Experiment, VersionStatus } from '../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiExperiment } from 'adhoc-api';
import { TranslateService } from '@ngx-translate/core';

import {
  VEXBuiltInThemes,
  Modal,
  DialogPreset,
  DialogFormModal,
  DialogPresetBuilder,
  VEXModalContext,
  vexV3Mode,
  providers
} from 'ngx-modialog/plugins/vex';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-code-version-edit',
  templateUrl: './code-version-edit.component.html',
  styleUrls: ['./code-version-edit.component.scss']
})
export class CodeVersionEditComponent implements OnInit {
  @Input() exp$: Subject<Experiment>;
  exp: Experiment;
  versions: Array<Version>;
  flagName: string;
  versionStatus = VersionStatus;
  flagKeys: Array<string>;

  constructor(private fb: FormBuilder,
    public modal: Modal,
    private toast: ToastrService,
    private translate: TranslateService,
    private apiExp: ApiExperiment) {
    this.flagKeys = new Array<string>();
  }

  ngOnInit() {
    this.exp$.subscribe(exp => {
      this.exp = exp;
      this.versions = this.exp.getVersions();
      //this.versions.sort((a: Version, b: Version) => {
      //const v1 = a.flags[Object.keys(a.flags)[0]];
      //const v2 = b.flags[Object.keys(b.flags)[0]];
      //if (typeof(v1) === 'number' && typeof(v2) === 'number') {
      //return v1 - v2;
      //}
      //return 0;
      //});
      this.flagName = Object.keys(this.exp.control.flags)[0];
      this.getFlagKeys(this.versions[0]);
    });
  }

  getNextVersionFlagVal(num?) {
    let val = num || this.versions.length;
    const is = this.versions.find(vs => {
      const firstKey = Object.keys(vs.flags)[0];
      return vs.flags[firstKey] === val;
    });
    return is ? this.getNextVersionFlagVal(++val) : val;
  }

  add() {
    const controlVersion = this.versions.find(v => v.isControl === true);
    const flags = Object.assign({}, controlVersion.flags);
    const firstkey = Object.keys(flags)[0];
    const thisExpControlCon = this.exp.control.conditions;
    const thisVersionAudId = this.exp.control.audience_id;
    if (flags.hasOwnProperty(firstkey) && typeof (flags[firstkey]) === 'number') {
      flags[firstkey] = this.getNextVersionFlagVal();
    }

    const originName = this.getOriginExpName();

    const newVersion = new Version({
      flags: flags,
      name: this.getName(this.versions.length, originName),
      isEdit: true,
      audience_id: thisVersionAudId,
      conditions: thisExpControlCon,
      typ: VersionTyp.EXP_TYPE_CODE,
      app_id: controlVersion.app_id,
      group_id: controlVersion.group_id
    });
    if (controlVersion.layer_id) {
      newVersion.layer_id = controlVersion.layer_id;
    }
    this.apiExp.createVersion(this.exp.app_id, newVersion).then(res => {
      newVersion.id = res['id'];
      this.versions.push(newVersion);
      this.changeExp();
    });
  }

  getName(index, originName) {
    const cname = this.translate.instant('codeversionedit.cname');
    const name = originName ? `${cname}${index}_${originName}` : `${cname}${index}`;
    if (this.versions.find(item => item.name === name)) {
      return this.getName(++index, originName);
    } else {
      return name;
    }
  }

  getOriginExpName() {
    const name = this.exp.control.name;
    const index = name.indexOf('_');
    if (index > -1) {
      return name.substr(index + 1, name.length);
    } else {
      return '';
    }
  }


  remove() {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'codeversionedit.deldesc', 'codeversionedit.delconfirm']);
    if (this.versions.length <= 2) {
      return this.toast.warning(dic['codeversionedit.deldesc']);
    }
    const index = this.versions.length - 1;
    this.modal.confirm()
      .message(dic['codeversionedit.delconfirm'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
          if (this.versions[index].id) {
            this.apiExp.delVersion(this.versions[index].id).then(res => {
              this.versions.splice(index, 1);
              this.changeExp();
            });
          } else {
            this.versions.splice(index, 1);
            this.changeExp();
          }
        }, err => {
        });
      });
  }

  changeExp() {
    this.exp.setVersions(this.versions);
    this.exp$.next(this.exp);
  }

  itemValid(v: Version) {
    this.versions.splice(this.versions.length - 1, 1);
    this.changeExp();
  }

  saveItem(v: Version) {
    this.changeExp();
  }

  getFlagKeys(version) {
    this.flagKeys = Object.keys(version.flags);
  }

}
