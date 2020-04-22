import { Routes } from '@angular/router';
import { ExperimentComponent } from './experiment.component';

import { DataRouter } from './data/data.component';
import { DevTestRouter } from './dev-test/dev-test.component';
import { SettingRouter } from './setting/setting.component';
import { AuthGuard } from '../../system/auth-guard.service';

export const ExperimentRouter = {
  path: 'exp/:id',
  component: ExperimentComponent,
  canActivate: [AuthGuard],
  children: [
    DataRouter,
    DevTestRouter,
    SettingRouter
  ]
};
