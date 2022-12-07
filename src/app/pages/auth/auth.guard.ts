import {Injectable, NgZone} from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad,
  Route, ActivatedRoute
} from '@angular/router';
import {AuthService} from './auth.service';
import {MENUS} from '../../@theme/modules/menu/data';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private zone: NgZone,
              private authSvc: AuthService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const role = this.authSvc.role(route.data.role);
    const url: string = state.url;
    return this.checkLogin(url, role);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): boolean {
    const url = `/${route.path}`;
    return this.checkLogin(url);
  }

  checkLogin(url: string, role?: boolean): boolean {
    const isLogged = this.authSvc.isLogged;
    if (isLogged && role) {
      return true;
    }
    let redirectUrl = '/auth/login';
    if (!role) {
      redirectUrl = '/denied';
    }

    if (!isLogged) {
      redirectUrl = '/auth/login';
    }

    this.zone.run(() => {
      this.router.navigate([redirectUrl]).then();
    });

    return false;
  }
}
