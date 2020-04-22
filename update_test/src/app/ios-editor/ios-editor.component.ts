import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { CurExpService } from '../service/cur-exp.service';
import { Version } from '../model';
import { ApiExperiment, CurAppService } from 'adhoc-api';

const IOS_API_VERSION = '5.0.0';

@Component({
  selector: 'app-editor',
  templateUrl: './ios-editor.component.html',
  styleUrls: ['./ios-editor.component.scss']
})
export class IosEditorComponent implements OnInit {

  url;

  @ViewChild('iframe') iframe: ElementRef;

  constructor(public sanitizer: DomSanitizer,
    private curExp: CurExpService,
    private curApp: CurAppService,
    private expApi: ApiExperiment,
    private router: Router
  ) { }

  ngOnInit() {
    window.addEventListener('message', e => {
      switch (e.data) {
        case 'edit-close': this.close(); break;
        case 'login': this.router.navigate(['/login']); break;
        case 'console': this.router.navigate(['/app_manage']); break;
      }
    });

    // test
    const expid = this.curExp.getCurExpId();
    this.expApi.getExpById(expid).then(exp => {
      const sdkVersion = this.getServerDataVersion(exp.getVersions());
      if (typeof sdkVersion === 'string') {
        if (sdkVersion === '0.0.0') {
          this.url = environment.old_ios_edit_url;
        } else {
          this.url = environment.new_ios_edit_url;
        }
        return;
      } else {
        this.close();
      }
    }).catch(() => {
      this.router.navigate(['/']);
    });
  }

  getServerDataVersion(versions: Version[]): string {
    let hasOld = false, hasNew = false;

    // 新创建试flags都为{}
    versions.forEach((v) => {
      const _msg = v.flags['__autoexperiment__'];
      if (_msg && _msg !== '{}') { hasOld = true; }
    });
    // 新编辑器编辑过的版本
    versions.forEach((v) => {
      const _msg = v.flags['__visualexperiment__'];
      if (_msg && _msg !== '{}') { hasNew = true; }
    });

    // 新编辑器或者没有编辑过的新版本，直接进入新编辑器
    return hasOld ? '0.0.0' : IOS_API_VERSION;
  }

  close() {
    window.close();
    const expid = this.curExp.getCurExpId();
    this.router.navigate(['/exp', expid, 'setting']);
  }


}

export const IosEditorRouter = {
  path: 'edit/ios',
  component: IosEditorComponent
};
