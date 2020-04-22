import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { NgModule, InjectionToken } from "@angular/core";
import { ApiModule } from "adhoc-api";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule, JsonpModule } from "@angular/http";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from "@angular/platform-browser/animations";
import {
  MatInputModule,
  MatAutocompleteModule,
  MatFormFieldModule,
  MatSliderModule,
  MatStepperModule,
  MatIconModule,
  MatCheckboxModule,
  MatDialogModule,
  MatMenuModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatTooltipModule,
} from "@angular/material";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { ToastrModule } from "ngx-toastr";

import { AppComponent } from "./app.component";
import { AuthGuard } from "./system/auth-guard.service";

import { ApiAuth, ApiExperiment, ApiData, ApiH5 } from "adhoc-api";

import { NgxEchartsModule } from "ngx-echarts";
import { MyDateRangePickerModule } from "mydaterangepicker";

import { routes } from "./app.router";
import { LoginComponent } from "./pages/login/login.component";
import { ChangeEmailComponent } from "./pages/change-email/change-email.component";
import { AppManageComponent } from "./pages/app-manage/app-manage.component";
import { RegisterComponent } from "./pages/register/register.component";
import { ForgotComponent } from "./pages/forgot/forgot.component";
import { ChangePwdComponent } from "./pages/change-pwd/change-pwd.component";
import { ActiveSuccessComponent } from "./pages/active-success/active-success.component";

import { AuthService } from "./service/auth.service";
import { TokenService } from "./service/token.service";
import { CurAppService } from "./service/cur-app.service";
import { AbLodash } from "./service/ab-lodash.service";
import { CurExpService } from "./service/cur-exp.service";
import { ABService } from "./service/ab.service";
import { RoleService } from "./service/role.service";
import { AbLangService } from "./service/ab-lang.service";
import { CookieService } from "./system/cookie.service";

import {
  ModalModule,
  OverlayRenderer,
  DOMOverlayRenderer,
  Overlay,
} from "ngx-modialog";
import { Modal, VexModalModule } from "ngx-modialog/plugins/vex";
import { PopoverModule } from "ngx-popover";
import { SelectModule } from "adhoc-ng2-select";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { NgxQRCodeModule } from "ngx-qrcode2";

import { AdhocCookieXSRFStrategy } from "./system/adhoc-cookie-xsrfstrategy.service";
import { CheckPwdComponent } from "./components/check-pwd/check-pwd.component";
import { ResetPwdComponent } from "./pages/reset-pwd/reset-pwd.component";
import { DemoComponent } from "./pages/demo/demo.component";
import { SortPipe } from "./pipes/sort.pipe";
import { AppNewComponent } from "./pages/app-new/app-new.component";
import { ExperimentComponent } from "./pages/experiment/experiment.component";
import { ExpTypSelectDialogComponent } from "./components/exp-typ-select-dialog/exp-typ-select-dialog.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { HeaderComponent } from "./components/header/header.component";
import { ExperimentListComponent } from "./pages/experiment-list/experiment-list.component";
import { SettingComponent } from "./pages/experiment/setting/setting.component";
import { DevTestComponent } from "./pages/experiment/dev-test/dev-test.component";
import { DataComponent } from "./pages/experiment/data/data.component";
import { UserFilterComponent } from "./pages/user-filter/user-filter.component";
import { UserFilterEditComponent } from "./pages/user-filter-edit/user-filter-edit.component";
import { ToDayPipe } from "./pipes/to-day.pipe";
import { DataOverviewComponent } from "./pages/experiment/data/data-overview/data-overview.component";
import { TrafficTrendComponent } from "./pages/experiment/data/traffic-trend/traffic-trend.component";
import { IndicatorDetailsComponent } from "./pages/experiment/data/indicator-details/indicator-details.component";
import { DataRetentionComponent } from "./pages/experiment/data/data-retention/data-retention.component";
import { SidebarComponent } from "./components/header/sidebar/sidebar.component";
import { BasicInfoComponent } from "./pages/experiment/setting/basic-info/basic-info.component";
import { FlowChartComponent } from "./pages/experiment/setting/flow-chart/flow-chart.component";
import { OperationControlComponent } from "./pages/experiment/setting/operation-control/operation-control.component";
import { UserFilterCreateComponent } from "./pages/user-filter-create/user-filter-create.component";
import { AccountComponent } from "./pages/account/account.component";
import { UserComponent } from "./components/user/user.component";
import { BindMobileModalComponent } from "./components/bind-mobile-modal/bind-mobile-modal.component";
import { AppListComponent } from "./components/app-list/app-list.component";
import { MessageListComponent } from "./components/message-list/message-list.component";
import { CiRangeComponent } from "./components/ci-range/ci-range.component";
import { VariantComponent } from "./components/variant/variant.component";
import { ColorDotComponent } from "./components/color-dot/color-dot.component";
import { LogComponent } from "./pages/experiment/setting/log/log.component";
import { PasswordConfirmComponent } from "./pages/password-confirm/password-confirm.component";
import { NavbarComponent } from "./components/navbar/navbar.component";

import { FilterNameEditComponent } from "./pages/user-filter-edit/filter-name-edit/filter-name-edit.component";
import { CodeVersionEditComponent } from "./components/code-version-edit/code-version-edit.component";
import { CodeStatEditComponent } from "./components/code-stat-edit/code-stat-edit.component";
import { CodeComStatEditComponent } from "./components/code-com-stat-edit/code-com-stat-edit.component";
import { CodeVersionItemComponent } from "./components/code-version-item/code-version-item.component";
import { BuildVersionEditComponent } from "./components/build-version-edit/build-version-edit.component";

import { FocusDirective } from "./directive/focus.directive";
import { CodeStatItemComponent } from "./components/code-stat-item/code-stat-item.component";
import { CodeComstatItemComponent } from "./components/code-comstat-item/code-comstat-item.component";
import { BuildVersionItemComponent } from "./components/build-version-item/build-version-item.component";

import { H5DescComponent } from "./components/h5-desc/h5-desc.component";
import { AndroidDescComponent } from "./components/android-desc/android-desc.component";
import { IosDescComponent } from "./components/ios-desc/ios-desc.component";
import { CodeNewComponent } from "./pages/code-new/code-new.component";
import { BuildNewComponent } from "./pages/build-new/build-new.component";
import { UrlNewComponent } from "./pages/url-new/url-new.component";
import { PowerComponent } from "./components/power/power.component";
import { ChargeStatusBarComponent } from "./components/charge-status-bar/charge-status-bar.component";
import { UrlVersionEditComponent } from "./components/url-version-edit/url-version-edit.component";
import { UrlVersionItemComponent } from "./components/url-version-item/url-version-item.component";
import { UrlVersionSelectComponent } from "./components/url-version-select/url-version-select.component";
import { DimensionsComponent } from "./components/dimensions/dimensions.component";
import { NotifyInfoComponent } from "./components/message-list/notify-info/notify-info.component";
import { ManagementComponent } from "./pages/management/management.component";
import { MemberEditComponent } from "./components/member-edit/member-edit.component";
import { ExpSortPipe } from "./pipes/exp-sort.pipe";

import { ClipModule } from "ng2-clip";
import { ExperimentCloneComponent } from "./components/experiment-clone/experiment-clone.component";
import { DateRangeComponent } from "./components/date-range/date-range.component";
import { ExportDialogComponent } from "./components/export-dialog/export-dialog.component";
import { RoleDirective } from "./directive/role.directive";
import { AiStatSelectDialogComponent } from "./components/ai-stat-select-dialog/ai-stat-select-dialog.component";
import { ExportDimensionDialogComponent } from "./components/export-dimension-dialog/export-dimension-dialog.component";
import { DevtestCpIdDialogComponent } from "./components/devtest-cp-id-dialog/devtest-cp-id-dialog.component";
import { environment } from "../environments/environment";
import { httpInterceptorProviders } from "./system/index";
import { AppletDescComponent } from "./components/applet-desc/applet-desc.component";
import { CodePushVersionComponent } from "./components/code-push-version/code-push-version.component";
import { WhiteListDialogComponent } from "./components/white-list-dialog/white-list-dialog.component";

import { IosEditorComponent } from "./ios-editor/ios-editor.component";
import { AndroidEditorComponent } from "./android-editor/android-editor.component";
import { AppConfigComponent } from "./pages/app-config/app-config.component";
import { SdkConfigComponent } from "./pages/app-config/sdk-config/sdk-config.component";
import { StatinfoListComponent } from "./pages/app-config/statinfo-list/statinfo-list.component";
import { ComstatinfoListComponent } from "./pages/app-config/comstatinfo-list/comstatinfo-list.component";
import { FlaginfoListComponent } from "./pages/app-config/flaginfo-list/flaginfo-list.component";
import { MyStepperNextDirective } from "./directive/my-stepper-next.directive";
import { ExpIdDialogComponent } from "./components/exp-id-dialog/exp-id-dialog.component";

const MODAL_PROVIDERS = [
  Modal,
  Overlay,
  { provide: OverlayRenderer, useClass: DOMOverlayRenderer },
];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    "../assets/i18n/",
    ".json?cb=" + new Date().getTime()
  );
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChangeEmailComponent,
    AppManageComponent,
    RegisterComponent,
    ForgotComponent,
    ChangePwdComponent,
    CheckPwdComponent,
    ResetPwdComponent,
    DemoComponent,
    SortPipe,
    AppNewComponent,
    ExperimentComponent,
    ExpTypSelectDialogComponent,
    LoadingComponent,
    HeaderComponent,
    ExperimentListComponent,
    SettingComponent,
    DevTestComponent,
    DataComponent,
    UserFilterComponent,
    UserFilterEditComponent,
    ToDayPipe,
    DataOverviewComponent,
    TrafficTrendComponent,
    IndicatorDetailsComponent,
    DataRetentionComponent,
    SidebarComponent,
    BasicInfoComponent,
    FlowChartComponent,
    OperationControlComponent,
    UserFilterCreateComponent,
    AccountComponent,
    UserComponent,
    BindMobileModalComponent,
    AppListComponent,
    MessageListComponent,
    CiRangeComponent,
    VariantComponent,
    ColorDotComponent,
    LogComponent,
    PasswordConfirmComponent,
    FilterNameEditComponent,
    NavbarComponent,
    CodeVersionEditComponent,
    CodeStatEditComponent,
    CodeComStatEditComponent,
    CodeVersionItemComponent,
    BuildVersionEditComponent,
    FocusDirective,
    CodeStatItemComponent,
    CodeComstatItemComponent,
    BuildVersionItemComponent,

    H5DescComponent,
    AndroidDescComponent,
    IosDescComponent,

    CodeNewComponent,
    BuildNewComponent,
    UrlNewComponent,
    PowerComponent,
    ChargeStatusBarComponent,
    UrlVersionEditComponent,
    UrlVersionItemComponent,
    UrlVersionSelectComponent,
    DimensionsComponent,
    NotifyInfoComponent,
    ManagementComponent,
    MemberEditComponent,
    ExpSortPipe,
    ExperimentCloneComponent,
    DateRangeComponent,
    ExportDialogComponent,
    ActiveSuccessComponent,
    RoleDirective,
    AiStatSelectDialogComponent,
    ExportDimensionDialogComponent,
    DevtestCpIdDialogComponent,
    AppletDescComponent,
    CodePushVersionComponent,
    WhiteListDialogComponent,
    IosEditorComponent,
    AndroidEditorComponent,
    AppConfigComponent,
    SdkConfigComponent,
    StatinfoListComponent,
    ComstatinfoListComponent,
    FlaginfoListComponent,
    MyStepperNextDirective,
    ExpIdDialogComponent,
  ],
  imports: [
    ApiModule.setup(environment),
    BrowserModule,
    HttpModule,
    JsonpModule,
    NgxEchartsModule,
    ModalModule.forRoot(),
    ScrollToModule.forRoot(),
    VexModalModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    MatSlideToggleModule,
    MyDateRangePickerModule,
    ToastrModule.forRoot(),
    MatFormFieldModule,
    MatSliderModule,
    MatIconModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatSelectModule,
    PopoverModule,
    SelectModule,
    NgxQRCodeModule,
    HttpClientModule,
    ClipModule,
    MatTooltipModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    RouterModule.forRoot(routes, {
      useHash: true,
    }),
  ],
  providers: [
    httpInterceptorProviders,
    ApiAuth,
    ApiExperiment,
    ApiData,
    ApiH5,
    AuthGuard,
    AuthService,
    RoleService,
    ABService,
    CookieService,
    CurExpService,
    CurAppService,
    AbLodash,
    AbLangService,
    TokenService,
    MODAL_PROVIDERS,
    AdhocCookieXSRFStrategy,
    HttpClient,
  ],
  entryComponents: [
    BindMobileModalComponent,
    ExpTypSelectDialogComponent,
    DevtestCpIdDialogComponent,
    CodePushVersionComponent,
    UserFilterCreateComponent,
    NotifyInfoComponent,
    ExperimentCloneComponent,
    UserFilterComponent,
    MemberEditComponent,
    PasswordConfirmComponent,
    ExportDialogComponent,
    ExportDimensionDialogComponent,
    UserFilterCreateComponent,
    WhiteListDialogComponent,
    AiStatSelectDialogComponent,
    IosEditorComponent,
    AndroidEditorComponent,
    ExpIdDialogComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
