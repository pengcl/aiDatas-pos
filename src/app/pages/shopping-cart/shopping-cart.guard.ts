import {Injectable} from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad,
  Route
} from '@angular/router';

import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {ShoppingCartService} from './shopping-cart.service';


@Injectable()
export class ShoppingCartGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private cartSvc: ShoppingCartService) {
  }

  cinema = this.appSvc.currentCinema;

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const url: string = state.url;
    return await this.checkCart(url);
  }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return await this.canActivate(route, state);
  }

  async canLoad(route: Route): Promise<boolean> {

    const url = `/${route.path}`;
    return await this.checkCart(url);
  }

  async checkCart(url: string): Promise<boolean> {
    if (this.cartSvc.isCreated) {
      return true;
    }
    const result = await this.cartSvc.createEmptyCart();
    return !!result;
  }
}
