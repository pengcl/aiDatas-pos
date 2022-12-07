import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, RouterStateSnapshot
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {RefundService} from './refund.service';


@Injectable()
export class RefundGuard implements CanActivate {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private refundSvc: RefundService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return true;
  }

}
