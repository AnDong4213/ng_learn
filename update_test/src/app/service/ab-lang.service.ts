import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AbLangService {
  language: string;
  iconType;
  constructor(
    private translate: TranslateService
  ) { }

  getLang() {
    return this.language
  }

  setLang(lang: string) {
    this.language = lang;
  }

  changeLang() {
    let thisLang = this.getLang();
    if (thisLang === "zh") {
      this.translate.use('en');
      this.iconType = 'icon-ZN';
      this.setLang('en');
    } else if (thisLang === "en") {
      this.translate.use('zh-CN');
      this.iconType = 'icon-EN';
      this.setLang('zh');
    }

    return this.iconType
  }


}
