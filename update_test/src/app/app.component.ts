import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbLangService } from './service/ab-lang.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  constructor(private translate: TranslateService,
    private language: AbLangService) {
    translate.addLangs(['zh-CN', 'en']);

    translate.setDefaultLang('zh-CN');


    const broswerLang = translate.getBrowserLang();
    language.setLang(broswerLang);
    translate.use(broswerLang.match(/en|zh-CN/) ? broswerLang : 'zh-CN');

    // translate.use('zh-CN');
    // translate.use('en');
  }

}
