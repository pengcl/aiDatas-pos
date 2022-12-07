import {Injectable} from '@angular/core';
import {AuthService} from '../../pages/auth/auth.service';
import {AppService} from '../../app.service';
import {ModalController} from '@ionic/angular';
import {PosAuthComponent} from '../../@theme/entryComponents/posAuth/posAuth';
import {ShoppingCartService} from '../../pages/shopping-cart/shopping-cart.service';
import {SnackbarService} from './snackbar.service';

@Injectable({providedIn: 'root'})
export class CheckAuth {


  constructor(private appSvc: AppService, private authSvc: AuthService,
              private modalController: ModalController, private snackbarSvc: SnackbarService,
              private shoppingCartSvc: ShoppingCartService) {

  }

  checkAuth(code) {
    let auth = null;
    this.appSvc.currentCinema.teminalAuthOperList.forEach(item => {
      if (item.dicCode === code) {
        auth = item;
      }
    });
    return auth;
  }

  auth(obj, datas , callback){
    if (obj.checkCart){
      const cart = this.shoppingCartSvc.checkShoppingCart();
      const status = (cart.seats.length > 0 || cart.products.length > 0 || cart.points.length > 0 || cart.coupons.length > 0);
      if (status){
        if (cart.products.length > 0) {
          this.snackbarSvc.show('购物车中还有商品，无法切换页面', 2000);
        }
        if (cart.seats.length > 0) {
          this.snackbarSvc.show('您已经选择了座位，无法切换页面', 2000);
        }
        if (cart.points.length > 0) {
          this.snackbarSvc.show('购物车中还有商品，无法切换页面', 2000);
        }
        if (cart.coupons.length > 0) {
          this.snackbarSvc.show('购物车中还有票券，无法切换页面', 2000);
        }
        return;
      }
    }
    // 具备授权资格无需弹出授权页面
    const isPosAuth = this.authSvc.currentPosAuth + '';
    console.log(isPosAuth);
    if (isPosAuth && isPosAuth === '1'){
      callback(0, datas);
      return;
    }
    const auth = this.checkAuth(obj.authFuctionCode);
    if (auth && auth.dicValue === '1') {
      if (datas === 'vip-tabs'){
        callback(-1 , datas);
      }
      obj.authFuctionName = auth.dicName;
      // 需授权,弹出授权页面
      this.presentModal(obj, datas , callback).then();
    }else{
      callback(0, datas);
    }
  }

  // 显示授权界面
  async presentModal(authparams, datas , callback) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: PosAuthComponent,
      componentProps: {authparams},
      cssClass: 'posauth-login-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      callback(1, datas);
    }
  }

}
