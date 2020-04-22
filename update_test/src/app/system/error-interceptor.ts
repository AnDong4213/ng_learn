import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { _throw } from 'rxjs/observable/throw';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';
import {CurAppService} from 'adhoc-api';
import {Modal} from 'ngx-modialog/plugins/vex';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../environments/environment';

/**
 * Intercepts the HTTP responses, and in case that an error/exception is thrown, handles it
 * and extract the relevant information of it.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  router: Router;
  constructor(private curApp: CurAppService,
              private modal: Modal,
              router: Router,
              private translate: TranslateService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .catch(errorResponse => {
        let errMsg: string;
        if (errorResponse instanceof HttpErrorResponse) {
          const err = errorResponse.message || JSON.stringify(errorResponse.error);
          errMsg = `${errorResponse.status} - ${errorResponse.statusText || ''} Details: ${err}`;
        } else {
          errMsg = errorResponse.message ? errorResponse.message : errorResponse.toString();
        }

        const curAppObj = this.curApp.getApp();
        const appid = curAppObj ? curAppObj.id : '';
        if (errorResponse.status === 403 && appid === 'ac66bf61-7608-4a5f-9bc4-9e7cf0f9694f') {
          this.demoNotWriteDialog();
        } else if (errorResponse.status === 403) {
          this.roleErrorDialog();
        }
        if (errorResponse.status === 400) {
          // TODO: emit 400 event
          console.log('Error: 400');
        }
        return _throw(errMsg);
      });
  }

  errorHandle(error: any): Observable<any> {console.log(error)
    const curAppObj = this.curApp.getApp();
    const appid = curAppObj ? curAppObj.id : '';
    if (error.status === 403 && appid === 'ac66bf61-7608-4a5f-9bc4-9e7cf0f9694f') {
      this.demoNotWriteDialog();
    }else if (error.status === 403) {
      this.roleErrorDialog();
    }
    if (error.status === 400) {
      this.router.navigate(['login']);
    }
    
    return throwError(error.error || 'Server error');
  }

  errorHandle4Promise(error: any):Promise<any> {
    const curAppObj = this.curApp.getApp();
    const appid = curAppObj ? curAppObj.id : '';
    if (error.status === 403 && appid === 'ac66bf61-7608-4a5f-9bc4-9e7cf0f9694f') {
      this.demoNotWriteDialog();
    }else if (error.status === 403) {
      this.roleErrorDialog();
    }
    if (error.status === 400) {
      this.router.navigate(['login']);
    }
    
    return Promise.reject(error.error || 'Server error')
  }


  roleErrorDialog() {
    this.modal.confirm()
    .message(`您暂无权限执行此操作！`)
    .cancelBtn('取消')
    .okBtn('确认')
    .showCloseButton(true)
    .open()
    .then(resultPromise => {
        return resultPromise.result.then(r => {
          this.forceRefreshPage();
        }, err => {
          this.forceRefreshPage();
        });
    });
  }


  demoNotWriteDialog() {
    const dic = this.translate.instant(['demo.warnings', 'demo.ok', 'modal.cancel']);
    this.modal.confirm()
    .message(dic['demo.warnings'])
    .cancelBtn(dic['modal.cancel'])
    .okBtn(dic['demo.ok'])
    .showCloseButton(true)
    .open()
    .then(resultPromise => {
        return resultPromise.result.then(r => {
          this.forceRefreshPage();
        }, err => {
          this.forceRefreshPage();
        });
    });
  }


  forceRefreshPage() {
    window.location.reload();
  }

}
