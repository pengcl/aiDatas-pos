import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {ProductIndexPage} from './index/index.page';
import {AddItemsInputDto, ShoppingCartService} from '../shopping-cart/shopping-cart.service';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {ProductService} from './product.service';
import {checkRedirect} from '../../@core/utils/extend';
import {SnackbarService} from '../../@core/utils/snackbar.service';

@Injectable()
export class ProductGuard implements CanDeactivate<ProductIndexPage> {
  constructor(private snackbarSvc: SnackbarService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private cartSvc: ShoppingCartService,
              private productSvc: ProductService) {
  }

  submit(): Promise<any> {
    return new Promise((resolve, reject) => {
      const selected = this.productSvc.currentSelected;
      const inputDto: AddItemsInputDto = this.cartSvc.createAddProductInputDto(selected);
      this.cartSvc.add(inputDto).subscribe(res => {
        if (res.status.status === 0) {
          resolve(true);
        }else {
          resolve(false);
        }
      });
    });
  }

  async canDeactivate(productIndexPage: ProductIndexPage,
                      route: ActivatedRouteSnapshot,
                      currentState: RouterStateSnapshot,
                      nextState?: RouterStateSnapshot) {
    if (nextState.url.indexOf('/shoppingCart/index') !== -1 ||
      nextState.url.indexOf('/checkout/index') !== -1 ||
      nextState.url.indexOf('/product/index') !== -1 ||
      nextState.url.indexOf('/ticket/index') !== -1) {
      return await this.submit();
    } else if (nextState.url.indexOf('/auth') !== -1) {
      return true;
    } else {
      const res = await checkRedirect(this.cartSvc);
      if (res.status) {
        return await this.submit();
      } else {
        if (res.error.products) {
          this.snackbarSvc.show('购物车中还有商品，无法切换页面', 2000);
        }
        if (res.error.seats) {
          this.snackbarSvc.show('您已经选择了座位，无法切换页面', 2000);
        }
        return false;
      }
    }
  }
}
