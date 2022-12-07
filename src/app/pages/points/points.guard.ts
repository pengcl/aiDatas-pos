import {Injectable, NgZone} from '@angular/core';
import {SnackbarService} from '../../@core/utils/snackbar.service';
import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {PointsIndexPage} from './index/index.page';
import {ShoppingCartService} from '../shopping-cart/shopping-cart.service';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {MemberService} from '../../@theme/modules/member/member.service';
import {checkRedirect} from '../../@core/utils/extend';

@Injectable()
export class PointsGuard implements CanDeactivate<PointsIndexPage> {
  constructor(private zone: NgZone,
              private snackbarSvc: SnackbarService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private memberSvc: MemberService,
              private cartSvc: ShoppingCartService) {
  }

  async canDeactivate(pointsIndexPage: PointsIndexPage,
                      route: ActivatedRouteSnapshot,
                      currentState: RouterStateSnapshot,
                      nextState?: RouterStateSnapshot) {
    if (nextState.url.indexOf('/points/index') !== -1 || nextState.url.indexOf('/checkout/index') !== -1) {
      return true;
    } else if (nextState.url.indexOf('/auth') !== -1) {
      return true;
    } else {
      const res = await checkRedirect(this.cartSvc);
      if (res.status) {
        return await this.memberSvc.remove();
      } else {
        if (res.error.products) {
          this.snackbarSvc.show('购物车中还有商品，无法切换页面', 2000);
        }
        if (res.error.seats) {
          this.snackbarSvc.show('您已经选择了座位，无法切换页面', 2000);
        }
        if (res.error.points) {
          this.snackbarSvc.show('购物车中还有商品，无法切换页面', 2000);
        }
        return false;
      }
    }
  }
}
