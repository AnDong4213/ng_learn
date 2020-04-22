import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { environment } from '../../environments/environment';
import { CookieService } from '../system/cookie.service';

@Injectable()
export class TokenService {
  tokenName = '';

  constructor(private cookie: CookieService) {
    this.tokenName = 'ADHOC_MEMBERSHIP_AUTH_KEY';
  }

  getToken() {
    const t = this.cookie.get(this.tokenName);
    if (t) {
      return t;
    }
    return '';
  }

  setToken(token: string) {
    this.cookie.setCookie(this.tokenName, token);
  }

  removeToken() {
    this.cookie.delete(this.tokenName);
  }

}

