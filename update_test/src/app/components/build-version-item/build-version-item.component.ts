import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Version, App, AppType, VersionTyp, Experiment } from '../../model';
import { ABService } from '../../service/ab.service';
import { ApiExperiment } from 'adhoc-api';
import { CurAppService } from '../../service/cur-app.service';
import { addParamsToURL } from '../../utils/url';

@Component({
  selector: 'app-build-version-item',
  templateUrl: './build-version-item.component.html',
  styleUrls: ['./build-version-item.component.scss']
})
export class BuildVersionItemComponent implements OnInit {

  @Input() version: Version;
  @Input() index: number;
  @Input() exp: Experiment;
  @Output() valid = new EventEmitter();
  @Output() ok = new EventEmitter();

  newVersionForm: FormGroup;
  descVersionForm: FormGroup;
  statForm: FormGroup;
  descEdit = false;
  app: App;

  appType = AppType;

  timestamp;

  constructor(private fb: FormBuilder,
    private apiExp: ApiExperiment,
    private curApp: CurAppService,
    private ab: ABService) {
    this.app = curApp.getApp();
    this.timestamp = Date.now();
  }

  ngOnInit() {
    this.newVersionForm = this.fb.group({
      name: [
        this.version.name,
        Validators.required
      ]
    });

    this.descVersionForm = this.fb.group({
      desc: [
        this.version.description
      ]
    });
  }

  clear() {
    this.version.isEdit = false;
    this.newVersionForm.reset();
  }


  save(e, form) {
    e.stopPropagation();
    if (!form.valid) {
      this.valid.emit(this.version);
      return false;
    }
    this.version.name = this.newVersionForm.controls['name'].value.trim();
    this.version.isEdit = false;
    this.version.conditions = this.exp.control.conditions;
    this.version.audience_id = this.exp.control.audience_id;
    this.apiExp.updateExpWithVersions(this.version.group_id, [this.version]).then(res => {
      this.ok.next(this.version);
    });
  }

  edit() {
    this.version.isEdit = true;
  }

  preview(v) {
    const annotation = this.exp.control.annotation;
    const u = JSON.parse(annotation['urls'])[0].url;
    const tabWindowId = window.open('about:blank', '_blank');
    const clientId = this.ab.getGenerateId();
    const qrCode = v['qr_code'];
    let url = u;
    url = addParamsToURL(url, { adhoc_force_client_id: clientId });
    const proxyURL = 'https://h5.appadhoc.com/redirectURL?url=' + encodeURIComponent(url);

    this.apiExp.forceClientId({ client_id: clientId, qr_code: qrCode }).then(function() {
      tabWindowId.location.href = proxyURL;
    });
  }


  saveDesc(e, form) {

    e.stopPropagation();
    if (!form.valid) {
      return false;
    }
    this.version.description = this.version.description.trim();
    this.descEdit = false;
    this.apiExp.updateExpWithVersions(this.version.group_id, [this.version]).then(res => {
    });
  }


  getPreviewImgURL(v: Version) {
    if (this.app.typ === AppType.H5 && this.version.typ === VersionTyp.EXP_TYPE_BUILD) {
      try {
        let url = JSON.parse(v.annotation['urls'])[0].url;
        url = encodeURIComponent(encodeURIComponent(url));
        return `https://sdk.appadhoc.com/screenshots/web-${v.id}-${url}.png`;
      } catch (e) {
        return '';
      }
    }
    if (this.app.typ === AppType.IOS) {
      return `https://sdk.appadhoc.com/screenshots/ios-${v.id}?${this.timestamp}`;
    }
    if (this.app.typ === AppType.ANDROID && this.version.typ === VersionTyp.EXP_TYPE_BUILD) {
      return `https://sdk.appadhoc.com/screenshots/android-${v.id}?${this.timestamp}`;
    }
    if (this.app.typ === AppType.ANDROID && this.version.typ === VersionTyp.EXP_TYPE_CODE) {
      return `https://sdk.appadhoc.com/screenshots/code-android-${v.id}?${this.timestamp}`;
    }
    return this.version.annotation['snapshot'];
  }

  editDesc() {
    this.descEdit = true;
  }

}
