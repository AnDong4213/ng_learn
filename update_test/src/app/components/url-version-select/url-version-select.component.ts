import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { App, Version } from '../../model';
import { ABService } from '../../service/ab.service';
import { ApiH5 } from 'adhoc-api';
import { TokenService } from '../../service/token.service';
import { CurAppService } from '../../service/cur-app.service';

@Component({
  selector: 'app-url-version-select',
  templateUrl: './url-version-select.component.html',
  styleUrls: ['./url-version-select.component.scss']
})
export class UrlVersionSelectComponent implements OnInit {
  @Input() versions: Array<Version>;
  @Output() isClose = new EventEmitter<boolean>();
  app: App;

  constructor(private curApp: CurAppService,
    private ab: ABService,
    private apih5: ApiH5,
    private token: TokenService) {
    this.app = curApp.getApp();
  }

  ngOnInit() {
  }

  goH5Edit(version) {
    const urldata = version.annotation['base_url'];
    const tab = window.open('about:blank', '_blank');
    const url = encodeURIComponent(urldata);
    const redirectURL = this.apih5.openSdk({
      url: url,
      authkey: this.token.getToken(),
      appid: version.app_id,
      groupid: version.group_id,
      expid: version.id,
      appkey: this.app.app_key,
      mode: 'urlsplite'
    });

    const self = this;
    tab.location.href = redirectURL;
  }

  close() {
    this.isClose.emit(true);
  }

}
