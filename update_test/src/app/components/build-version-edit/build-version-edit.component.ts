import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Version, VersionTyp, App, AppType, Experiment } from '../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurAppService } from '../../service/cur-app.service';
import { ABService } from '../../service/ab.service';
import { TokenService } from '../../service/token.service';
import { ApiExperiment, ApiH5 } from 'adhoc-api';
import { environment } from '../../../environments/environment';

import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-build-version-edit',
  templateUrl: './build-version-edit.component.html',
  styleUrls: ['./build-version-edit.component.scss']
})
export class BuildVersionEditComponent implements OnInit {
  @Input() exp$: Subject<Experiment>;
  exp: Experiment;
  app: App;
  versions: Array<Version>;
  buildInfo: any;

  appType = AppType;

  constructor(private curApp: CurAppService,
    private token: TokenService,
    private apih5: ApiH5,
    private router: Router,
    private apiExp: ApiExperiment,
    private ab: ABService) {
    this.app = curApp.getApp();
    this.exp = new Experiment();
  }

  ngOnInit() {
    this.exp$.subscribe(exp => {
      this.exp = exp;
      this.versions = this.exp.getVersions();
      if (this.isType('h5')) {
        this.buildInfo = this.exp.control.annotation.hasOwnProperty('urls') ? JSON.parse(this.exp.control.annotation['urls'])[0] : null;
      }
    });
  }

  add() {
    const newVersion = new Version({
      name: '',
      type: VersionTyp.EXP_TYPE_CODE,
      isEdit: true
    });
    this.versions.push(newVersion);
    this.changeExp();
  }

  remove() {
    const index = this.versions.length - 1;
    this.versions.splice(index, 1);
    this.changeExp();
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

  isType(typ: string): boolean {
    switch (typ) {
      case 'h5':
        return this.app.typ === AppType.H5 ? true : false;
      case 'android':
        return this.app.typ === AppType.ANDROID ? true : false;
      case 'ios':
        return this.app.typ === AppType.IOS ? true : false;
    }
    return false;
  }

  async updateH5Data() {
    const res = await this.apiExp.getExpById(this.exp.id)

    this.exp$.next(new Experiment(res as Experiment));

  }

  goH5Edit() {
    const tab = window.open('about:blank', '_blank');
    const url = encodeURIComponent(this.buildInfo['url']);
    const redirectURL = this.apih5.openSdk({
      url: url,
      authkey: this.token.getToken(),
      appid: this.app.id,
      groupid: this.exp.id,
      expid: this.exp.control.id,
      appkey: this.app.app_key
    });
    const self = this;
    this.ab.binWindowClose(tab, () => {
      self.updateH5Data();
    });
    tab.location.href = redirectURL;
  }

  goAndroidEdit() {
    this.router.navigate(['/', 'edit', 'android']);
  }

  goiOSEdit() {
    this.router.navigate(['/', 'edit', 'ios']);
  }

}
