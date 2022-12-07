import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {JwtInterceptors} from './jwt.interceptors';
import {ErrorInterceptor} from './error.interceptors';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {TimeoutInterceptor, DEFAULT_TIMEOUT} from './timeout.interceptors';
import {PaginatorInterceptors} from './paginator.interceptors';

export const INTERCEPTORS = [
  {provide: MatPaginatorIntl, useValue: PaginatorInterceptors()},
  {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptors, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true},
  {provide: DEFAULT_TIMEOUT, useValue: 60000}
];
