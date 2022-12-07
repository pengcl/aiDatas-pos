import {Injectable, InjectionToken, Inject} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpEvent} from '@angular/common/http';
import {empty, Observable, TimeoutError} from 'rxjs';
import {timeout, catchError} from 'rxjs/operators';
import {ToastService} from '../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number,
              private toastSvc: ToastService,
              private message: NzMessageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modified = req.clone({
      setHeaders: {'X-Request-Timeout': `${this.defaultTimeout}`}
    });
    return next.handle(modified).pipe(
      timeout(this.defaultTimeout),
      catchError(err => {
        this.toastSvc.hide();
        if (err instanceof TimeoutError) {
          console.error('Timeout has occurred', req.url);
          this.message.error('请求超时，请稍后再试！');
        }
        return empty();
      })
    );
  }
}
