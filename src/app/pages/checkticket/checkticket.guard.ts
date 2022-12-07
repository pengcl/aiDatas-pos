import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, RouterStateSnapshot
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {CheckTicketService} from './checkticket.service';


@Injectable()
export class CheckTicketGuard implements CanActivate {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private checktTcketSvc: CheckTicketService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return true;
  }

}
