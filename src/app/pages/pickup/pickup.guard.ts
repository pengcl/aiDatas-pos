import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, RouterStateSnapshot
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {PickupService} from './pickup.service';


@Injectable()
export class PickupGuard implements CanActivate {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private pickupSvc: PickupService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return true;
  }

}
