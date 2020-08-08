import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import {
  HomeContainerComponent,
  HomeDetailComponent,
  HomeGrandComponent,
  HomeAuxComponent
} from './components';
import { HomeService, token } from './services';

@NgModule({
  declarations: [
    HomeContainerComponent,
    HomeDetailComponent,
    HomeGrandComponent,
    HomeAuxComponent
  ],
  // 传统写法，如果采用这种写法，就不能在 service 中写 `providedIn`
  providers: [{ provide: token, useValue: 'http://localhost' }],
  imports: [SharedModule, HomeRoutingModule]
})
export class HomeModule {}
