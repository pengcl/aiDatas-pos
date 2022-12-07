import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, RouterStateSnapshot
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {GetTicketService} from './getticket.service';


@Injectable()
export class GetTicketGuard implements CanActivate {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private getticketSvc: GetTicketService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return true;
  }

}
