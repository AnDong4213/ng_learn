import { Routes } from '@angular/router';

import { LoginRouter } from './pages/login/login.component';
import { RegisterRouter } from './pages/register/register.component';
import { ForgotRouter } from './pages/forgot/forgot.component';
import { AppManageRouter } from './pages/app-manage/app-manage.component';
import { ChangeEmailRouter } from './pages/change-email/change-email.component';
import { ChangePwdRouter } from './pages/change-pwd/change-pwd.component';
import { ResetPwdRouter } from './pages/reset-pwd/reset-pwd.component';
import { DemoRouter } from './pages/demo/demo.component';
import { AppNewRouter } from './pages/app-new/app-new.component';
import { ExperimentListRouter } from './pages/experiment-list/experiment-list.component';
import { ExperimentRouter } from './pages/experiment/experiment.router';
import { UserFilterRouter } from './pages/user-filter/user-filter.component';
import { UserFilterEditRouter } from './pages/user-filter-edit/user-filter-edit.component';
import { SdkConfigRouter } from './pages/app-config/app-config.component';
import { AccountRouter } from './pages/account/account.component';
import { PasswordConfirmRouter } from './pages/password-confirm/password-confirm.component';
import { CodeNewRouter } from './pages/code-new/code-new.component';
import { BuildNewRouter } from './pages/build-new/build-new.component';
import { UrlNewRouter } from './pages/url-new/url-new.component';
import { ManagementRouter } from './pages/management/management.component';
import { ActiveSuccessRouter } from './pages/active-success/active-success.component';
import { IosEditorRouter } from './ios-editor/ios-editor.component';
import { AndroidEditorRouter } from './android-editor/android-editor.component';

export const routes: Routes = [
  UrlNewRouter,
  CodeNewRouter,
  BuildNewRouter,
  LoginRouter,
  RegisterRouter,
  ForgotRouter,
  AppManageRouter,
  ChangeEmailRouter,
  ChangePwdRouter,
  ResetPwdRouter,
  DemoRouter,
  AppNewRouter,
  ExperimentListRouter,
  ExperimentRouter,
  UserFilterRouter,
  UserFilterEditRouter,
  SdkConfigRouter,
  AccountRouter,
  PasswordConfirmRouter,
  ManagementRouter,
  ActiveSuccessRouter,
  IosEditorRouter,
  AndroidEditorRouter
];
