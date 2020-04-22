import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Version, VersionStatus, Experiment } from '../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiExperiment } from 'adhoc-api';
import { ToastrService } from 'ngx-toastr';
import { URLValidator } from '../../utils/validators/url';
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


@Component({
  selector: 'app-url-version-item',
  templateUrl: './url-version-item.component.html',
  styleUrls: ['./url-version-item.component.scss']
})
export class UrlVersionItemComponent implements OnInit {
  @Input() version: Version;
  @Input() url: string;
  @Input() index: number;
  @Input() thisExp: Experiment;
  @Input() versions: Array<Version>;
  urlForm: FormGroup;
  desForm: FormGroup;
  versionNameForm: FormGroup;
  isUrlEdit = false;
  isDesEdit = false;
  @Output() valid = new EventEmitter();
  @Output() ok = new EventEmitter();
  @Output() delOk = new EventEmitter();
  versionStatus = VersionStatus;
  isDel = false;
  isEditName = false;
  versionNameFormSubmit = false;
  oldName: string;

  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    public modal: Modal,
    private translate: TranslateService,
    private apiExp: ApiExperiment) { }

  ngOnInit() {
    this.oldName = this.version.name;
    this.urlForm = this.fb.group({
      url: [this.url,
      Validators.compose([
        Validators.required,
        URLValidator()
      ])
      ]
    });
    this.desForm = this.fb.group({
      des: [
        this.version.description,
        Validators.required
      ]
    });
    this.versionNameForm = this.fb.group({
      versionName: [
        this.version.name,
        Validators.required
      ]
    });
  }

  editUrl() {
    this.isUrlEdit = true;
  }

  save(e, form) {
    e.stopPropagation();
    if (!form.valid) {
      this.valid.emit(this.version);
      return false;
    }
    this.isUrlEdit = false;
    this.version.isEdit = false;
    const values = form.value;

    this.version.annotation['base_url'] = values['url'].replace(/\s+/g, '');
    const newflag = {};
    const flagKey = Object.entries(this.version.flags)[0][0];
    const flagValue = JSON.parse(Object.entries(this.version.flags)[0][1]);
    Object.entries(flagValue)[0][1]['data']['newPageUrl'] = values['url'].trim();

    newflag[flagKey] = JSON.stringify(flagValue);

    this.version.flags = newflag;
    this.version.conditions = this.thisExp.control.conditions;
    this.version.audience_id = this.thisExp.control.audience_id;
    this.apiExp.updateExpWithVersions(this.version.group_id, [this.version]).then(res => {
      this.ok.next(this.version);
    });

  }

  delete() {
    const dic = this.translate.instant(['modal.cancel', 'modal.ok', 'urlversionitem.p11', 'urlversionitem.p12'])

    if (this.versions.length <= 2) {
      this.toast.warning('至少需要有一个试验版本');
      return;
    }
    this.modal.confirm()
      .message(dic['urlversionitem.p12'])
      .cancelBtn(dic['modal.cancel'])
      .okBtn(dic['modal.ok'])
      .showCloseButton(true)
      .open()
      .then(resultPromise => {
        return resultPromise.result.then(r => {
          this.isDel = true;
          this.apiExp.delVersion(this.version.id).then(res => {
            this.delOk.next(this.version);
          });
        }, err => {
        });
      });

  }


  editDes() {
    this.isDesEdit = true;
  }

  saveDes(e, form) {
    e.stopPropagation();
    if (!form.valid) {
      this.valid.emit(this.version);
      return false;
    }
    this.isDesEdit = false;

    const values = form.value;
    this.version.description = values['des'].trim();

    this.apiExp.updateExpWithVersions(this.version.group_id, [this.version]).then(res => {
      this.ok.next(this.version);
    });
  }

  isRegExpMode() {
    if (!this.version && !this.version.annotation.hasOwnProperty('urls')) {
      return false;
    }
    try {
      const json = JSON.parse(this.version.annotation['urls'])[0];
      const mode = json['mode'];
      return mode === 'regex' || mode === 'jsregexp' ? true : false;
    } catch (e) {
      return false;
    }
  }

  getRegExpURL() {
    try {
      const json = JSON.parse(this.version.annotation['urls'])[0];
      const url = json['regexp'];
      return url;
    } catch (e) {
      /* handle error */
      return 'error';
    }
  }

  getRegExpMode() {
    try {
      const json = JSON.parse(this.version.annotation['urls'])[0];
      return json['mode'];
    } catch (e) {
      /* handle error */
      return '';
    }
  }

  editName() {
    this.isEditName = true;
  }

  saveName(e, form) {
    e.stopPropagation();
    this.versionNameFormSubmit = true;
    const vname = form.value.versionName.trim();
    if (vname === this.oldName || vname == '') {
      this.version.name = this.oldName;
      this.isEditName = false;
      return false;
    }
    if (!form.valid) {
      return false;
    }
    this.isEditName = false;

    this.version.name = vname;

    this.apiExp.updateExpWithVersions(this.version.group_id, [this.version]).then(res => {
      this.ok.next(this.version);
      this.toast.success('版本名称修改成功');
      this.oldName = vname;
    });

  }

}
