import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../../system/auth-guard.service';
import { ApiData, ApiExperiment } from 'adhoc-api';

import { App, VersionStatus, Experiment, VersionTyp, Stat, Layer } from '../../model';
import { CurAppService } from '../../service/cur-app.service';

@Component({
  selector: 'app-app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss']
})
export class AppConfigComponent implements OnInit {
  app: App;
  allexp: Array<Experiment>;
  layers: Array<Layer>;
  stats: Array<Stat>;

  curpage: string = 'sdkconfig';

  EXP_TYPE_CODE = VersionTyp.EXP_TYPE_CODE;
  VersionStatus = VersionStatus.Run;

  constructor(
    private apiExp: ApiExperiment,
    private apiData: ApiData,
    private curApp: CurAppService
  ) {

  }

  ngOnInit() {
    this.app = this.curApp.getApp();
    // 获取该App下的所有的试验
    this.apiExp.getAllExperiments(this.app.id).then(res => {
      this.allexp = res;
    });

    // 获取该App下的试验的所有的层
    this.apiExp.getLayersByAppId(this.app.id).then(layer => {
      this.layers = layer
    })

    // 获取该App下试验的所有指标
    this.apiData.getStat(this.app.id).then(stat => {
      this.stats = stat;
    })

  }


}

export const SdkConfigRouter = {
  path: 'sdk_config',
  canActivate: [AuthGuard],
  component: AppConfigComponent
};
