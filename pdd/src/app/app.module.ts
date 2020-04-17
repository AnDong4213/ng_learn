import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollableTabComponent, ImageSliderComponent } from './components';

@NgModule({
  declarations: [
    // 我这个组件有哪些模块
    AppComponent,
    ScrollableTabComponent,
    ImageSliderComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent], // 根模块
})
export class AppModule {
  name = 'ng';
}
