import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { environment } from '../../environments/environment';

@Injectable()
export class CookieService {
  expireDay = 3;
  options

  constructor() { }

  setCookie(key, val) {
    //if (environment.production) {
    Cookie.set(key, val, this.expireDay, '/', environment['cookie_domain']);
    //}else {
    //Cookie.set(this.tokenName, t.text, t.expire);
    //}
  }

  delete(key) {
    Cookie.delete(key);
  }

  get(key) {
    return Cookie.get(key);
  }

}
