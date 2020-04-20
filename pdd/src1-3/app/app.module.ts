import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    // 我这个组件有哪些模块
    AppComponent,
  ],
  imports: [BrowserModule, FormsModule, SharedModule],
  providers: [],
  bootstrap: [AppComponent], // 根模块
})
export class AppModule {
  name = 'ng';
}
