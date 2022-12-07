import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, RouterStateSnapshot
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {SupplementService} from './supplement.service';


@Injectable()
export class SupplementGuard implements CanActivate {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private supplementSvc: SupplementService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return true;
  }

}
