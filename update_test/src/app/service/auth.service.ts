import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { User } from '../model';
import { TokenService } from './token.service';
import { ApiAuth } from 'adhoc-api';
import { environment } from '../../environments/environment';
import { CookieService } from '../system/cookie.service';

const USER_EMAIL_KEY = 'U_EMAIL';
const USER_INFO_DATA = 'U_INFO';
const OLD_USER_EMAIL_KEY = 'ADHOC_MEMBERSHIP_USER';

import { map } from 'rxjs/operators';
import 'rxjs/add/operator/catch';

/*
 * 考虑多种用户权限的展示和安全问题，这里只缓存用户email, 具体信息，每次都从服务器读取
 */
@Injectable()
export class AuthService {

  constructor(private tokenService: TokenService,
    private apiAuth: ApiAuth,
    private cookie: CookieService) { }

  isAuth() {
    return this.tokenService.getToken() ? true : false;
  }


  login(user: User, callback: Function) {
    this.apiAuth.login(user).then(response => {
      return callback(response);
    });
  }


  logout() {
    this.tokenService.removeToken();
    this.cookie.delete(OLD_USER_EMAIL_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  }

  setUser(email: string) {
    localStorage.setItem(USER_EMAIL_KEY, email);
    this.cookie.setCookie(OLD_USER_EMAIL_KEY, email);
  }

  getUserEmail() {
    return localStorage.getItem(USER_EMAIL_KEY);
  }

  getUser() {
    return localStorage.getItem(USER_EMAIL_KEY);
  }

}

