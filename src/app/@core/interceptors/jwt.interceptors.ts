import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from '../../pages/auth/auth.service';

@Injectable()
export class JwtInterceptors implements HttpInterceptor {
  constructor(private authSvc: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userToken = this.authSvc.currentToken ? this.authSvc.currentToken : null;
    const version = '1.0.0';
    const head: any = {
      clientIP: '192.168.103.56',
      questUID: 'C943B16E39A00001715A87502E1A1D65',
      userToken,
      version
    };
    req.body.head = head;
    return next.handle(req);
  }

}
