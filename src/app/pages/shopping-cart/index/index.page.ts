import {Component, NgZone, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {ToastService} from '../../../@theme/modules/toast';
import {ModalController} from '@ionic/angular';
import {AuthService} from '../../auth/auth.service';
import {AppService} from '../../../app.service';
import {ShoppingCartService} from '../shopping-cart.service';
import {TicketService} from '../../ticket/ticket.service';
import {DialogService} from '../../../@theme/modules/dialog';
import {ShoppingCartChangeComponent} from '../entryComponents/change/change.component';
import {groupSame} from '../shopping-cart.utils';
import {CartChangeTypeComponent} from '../entryComponents/changeType/changeType.component';
import {ProductService} from '../../product/product.service';
import {formatProducts} from '../../../@core/utils/extend';
import {CheckAuth} from '../../../@core/utils/check-auth';

@Component({
  selector: 'app-shopping-cart-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss']
})
export class ShoppingCartIndexPage {
  cinema = this.appSvc.currentCinema;
  cart;
  groupProduct = [];
  subscribe;

  constructor(private zone: NgZone,
              private cdr: ChangeDetectorRef,
              private location: LocationStrategy,
              private modalController: ModalController,
              private route: ActivatedRoute,
              private router: Router,
              private toastSvc: ToastService,
              private dialogSvc: DialogService,
              private authSvc: AuthService,
              private appSvc: AppService,
              private shoppingCartSvc: ShoppingCartService,
              private productSvc: ProductService,
              private ticketSvc: TicketService,
              private checkAuth: CheckAuth) {
  }

  ionViewDidEnter() {
    this.getDetails();
    this.subscribe = this.ticketSvc.getSelectedStatus().subscribe(res => {
      this.getDetails();
    });
  }

  ionViewDidLeave() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

  getDetails() {
    this.shoppingCartSvc.details().subscribe(res => {
      this.cart = res.data;
      let products = [];
      if (res.data && res.data.posShopCartResDTOList) {
        products = formatProducts(res.data.posShopCartResDTOList);
        this.groupProduct = groupSame(products);
      } else {
        this.groupProduct = [];
      }
      this.productSvc.updateSelectedStatus(products);
    });
  }

  async presentModal(type) {
    /*if (!this.cart || !this.cart.posShopCartResDTOList || this.cart.posShopCartResDTOList.length === 0) {
      return false;
    }*/
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ShoppingCartChangeComponent,
      componentProps: {type, products: this.cart.posShopCartResDTOList}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.getDetails();
    }
  }

  async presentChangeTypeModal(seat) {
    console.log(seat);
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: CartChangeTypeComponent,
      componentProps: {selected: seat}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.getDetails();
    }
  }

  changeType(item) {
    this.presentChangeTypeModal(item).then();
  }

  updatePrice(type) {
    const authparams = {
      authFuctionCode: 'operModPrice',
      uidAuthFuction: this.cart.uidShopCart,
      authFuctionName: '',
      authFuctionType: '0'
    };
    if (type === 'free'){
      authparams.uidAuthFuction = 'operSetFree';
    }
    this.checkAuth.auth(authparams, type , () => {
      this.presentModal(type).then();
    });
  }

  empty() {
    this.dialogSvc.show({content: '您确定要清空购物车吗？', confirm: '是的', cancel: '不了'}).subscribe(result => {
      if (result.value) {
        this.shoppingCartSvc.empty(() => {
          this.ticketSvc.updateForceFreshStatus(true);
          this.getDetails();
          this.location.back();
        });
      }
    });
  }

  submit() {
    console.log('去结算');
    this.zone.run(() => {
      this.router.navigate(['/checkout/index'], {
        queryParams: {
          uidShopCart: this.shoppingCartSvc.currentCart,
          businessType: 'SALE',
          target: this.route.snapshot.queryParams.target
        }
      }).then();
    });
  }

  del(item, type) {
    if (type === 'seat') {
      this.delSeat(item);
    }
    if (type === 'product') {
      this.delProduct(item);
    }
  }

  loss() {
    /*this.shoppingCartSvc.loss().subscribe(res => {
      console.log(res);
    });*/
  }

  delSeat(item) {
    this.toastSvc.loading('删除中...', 0);
    this.shoppingCartSvc.delV1({
      resType: 1,
      uid: '',
      uidResource: item.uidPosResSeat,
      uidShopCart: this.shoppingCartSvc.currentCart
    }).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        // this.toastSvc.success('删除成功');
        const selected = this.ticketSvc.currentSelected;
        selected[item.uidPosResSeat] = false;
        this.ticketSvc.updateSelectedStatus(selected);
      }
    });
  }

  delProduct(item) {
    const inputDto = {
      resType: 0,
      uidPosResource: item.uidResource
    };
    this.toastSvc.loading('删除中...', 0);
    this.shoppingCartSvc.batchDelV1(inputDto).subscribe(res => {
      this.toastSvc.hide();
      this.getDetails();
    });
  }

  back() {
    this.location.back();
  }
}
