import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import {
  HomeModule,
  ParamNameInterceptor,
  NotificationInterceptor,
} from './home';

import localeZh from '@angular/common/locales/zh-Hans';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    HomeModule,
  ],
  providers: [
    {
      // 系统提供的 LOCALE_ID 就是一个 InjectionToken
      provide: LOCALE_ID,
      useValue: 'zh-Hans',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ParamNameInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NotificationInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeZh, 'zh');
  }
}
