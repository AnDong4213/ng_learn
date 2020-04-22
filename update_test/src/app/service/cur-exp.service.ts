import { Injectable } from '@angular/core';
import { App, Experiment, AppType } from '../model';
import { Cookie } from 'ng2-cookies';
import { environment } from '../../environments/environment';
import { CookieService } from '../system/cookie.service';

const CUR_EXP_KEY = 'ADHOC_MEMBERSHIP_GROUPID_KEY';

@Injectable()
export class CurExpService {

  constructor(private cookie: CookieService) { }

  setCurExp(exp: Experiment) {
    this.cookie.setCookie(CUR_EXP_KEY, exp.id);
  }

  getCurExpId() {
    return this.cookie.get(CUR_EXP_KEY);
  }

}
