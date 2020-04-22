import { Component, OnInit, Input } from '@angular/core';
import { Experiment } from '../../model/experiment';
import { Version, VersionTyp, App, AppType, VersionStatus } from '../../model';
import { Subject } from 'rxjs';
import { ApiExperiment } from 'adhoc-api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-url-version-edit',
  templateUrl: './url-version-edit.component.html',
  styleUrls: ['./url-version-edit.component.scss']
})
export class UrlVersionEditComponent implements OnInit {
  @Input() exp$: Subject<Experiment>;
  exp: Experiment;
  app: App;
  versions: Array<Version>;
  buildInfo: Array<Object>;
  versionStatus = VersionStatus;
  lastAddlock = false;

  constructor(private apiExp: ApiExperiment,
    private translate: TranslateService,
    private toast: ToastrService) {
    this.exp = new Experiment();
  }

  ngOnInit() {
    this.exp$.subscribe(exp => {
      this.exp = exp;
      this.versions = this.exp.getVersions();
      this.buildInfo = this.exp.control.annotation.hasOwnProperty('urls') ? JSON.parse(this.exp.control.annotation['urls'])[0] : null;
      this.lastAddlock = false;
    });
  }

  generateExperimentName(num = 0, originName) {
    const dic = this.translate.instant(['detail.originversion', 'codenew.version']);
    if (num === 0) {
      return dic['detail.originversion'];
    }
    const name = originName ? `${dic['codenew.version']}${num}_${originName}` : `${dic['codenew.version']}${num}`;
    const findResult = this.versions.find(version => version.name === name);
    if (findResult) {
      ++num;
      return this.generateExperimentName(num, originName);
    } else {
      return name;
    }
  }



  add() {
    if (this.lastAddlock) {
      return;
    }
    this.lastAddlock = true;
    const controlVersion = this.versions.find(v => v.isControl === true);
    const newflag = {};
    const flagKey = Object.entries(controlVersion.flags)[0][0];
    const flagValue = JSON.parse(Object.entries(controlVersion.flags)[0][1]);
    Object.entries(flagValue)[0][1]['data']['newPageUrl'] = '';
    newflag[flagKey] = JSON.stringify(flagValue);

    const originName = this.getOriginExpName();

    const newVersion = new Version({
      annotation: {
        base_url: '',
        urls: controlVersion.annotation['urls']
      },
      flags: newflag,
      name: this.generateExperimentName(this.versions.length, originName),
      isEdit: true,
      typ: VersionTyp.EXP_TYPE_URL,
      app_id: controlVersion.app_id,
      group_id: controlVersion.group_id
    });
    controlVersion.layer_id ? newVersion.layer_id = controlVersion.layer_id : '';
    this.apiExp.createVersion(this.exp.app_id, newVersion).then(res => {
      newVersion.id = res['id'];
      this.versions.push(newVersion);
      this.changeExp();
    });

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

  saveItem(v: Version) {
    this.changeExp();
  }

  delVersion(v: Version) {
    const index = this.versions.indexOf(v);
    if (index > -1) {
      this.versions.splice(index, 1);
    }
    this.changeExp();
  }

  changeExp() {
    this.exp.setVersions(this.versions);
    this.exp$.next(this.exp);
  }

}
