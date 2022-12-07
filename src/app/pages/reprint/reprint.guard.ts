import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, RouterStateSnapshot
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {ReprintService} from './reprint.service';


@Injectable()
export class ReprintGuard implements CanActivate {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private reprintSvc: ReprintService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return true;
  }

}
