import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ApiAuth } from 'adhoc-api';
import { UserInfo, User } from '../model';
import { Observable, throwError } from 'rxjs';

import { map, catchError } from 'rxjs/operators'

@Injectable()
export class RoleService {
  roles: Array<any>;
  getUserTime: number;
  expiredTime = 1000 * 60 * 5; // 过期时间

  constructor(private authService: AuthService,
    private apiAuth: ApiAuth) { }

  async getRoles(): Promise<any> {
    let userInfo$;
    const userEmail = this.authService.getUserEmail();
    let userinfo = await this.apiAuth.getUserInfo(userEmail)

    if (!userinfo || Date.now() > this.getUserTime + this.expiredTime) {
      userInfo$ = this.apiAuth.getUserInfo(userEmail).then(
        res => {
          this.getUserTime = Date.now();

          return userinfo = res as UserInfo;
        },
        // catchError(this.handleError)
      );
    } else {
      userInfo$ = Observable.create(serve => {

        serve.next(userinfo);
        serve.complete();
      }).toPromise();

    }

    return userInfo$;
  }


  async checkRole(key: string) {
    let uinfo = await this.getRoles();
    return uinfo['features'].includes(key);
  }

  private handleError(error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';

    return throwError(errMsg);
  }

}
