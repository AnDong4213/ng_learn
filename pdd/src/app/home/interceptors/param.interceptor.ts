import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class ParamNameInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // return next.handle(req);
    // 对请求消息进行处理
    const modifiedReq = req.clone({
      setParams: { icode: environment.icode },
    });
    return next.handle(modifiedReq);
  }
}
