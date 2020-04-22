import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders
} from '@angular/common/http';

import { TokenService, HTTPBypassHeader } from 'adhoc-api';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq;
    if (req.headers.has(HTTPBypassHeader.getHeaderName())) {
      const headers = req.headers.delete(HTTPBypassHeader.getHeaderName());
      authReq = req.clone({ headers: headers });
    } else if (req.headers.has(HTTPBypassHeader.getUploadHeaderName())) {
      // For Upload interface
      // let headerMap = {'Content-Type': 'multipart/form-data'};
      let headerMap = {};
      if (this.tokenService.getToken()) {
        headerMap['auth-key'] = this.tokenService.getToken();
      }
      const authReq1 = req.clone({ setHeaders: headerMap });
      let headers2 = authReq1.headers.delete(HTTPBypassHeader.getUploadHeaderName());
      authReq = req.clone({ headers: headers2 });
    }
    else {
      const headerMap = { 'Content-Type': 'application/json' };
      if (this.tokenService.getToken()) {
        headerMap['auth-key'] = this.tokenService.getToken();
      }
      authReq = req.clone({ setHeaders: headerMap });
    }
    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }

}
