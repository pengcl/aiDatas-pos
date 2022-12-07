import {
  Component,
  NgZone,
  OnInit,
  OnDestroy, Input, SimpleChanges, OnChanges
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ToastService } from '../../../../@theme/modules/toast';
import { AuthService } from '../../../auth/auth.service';
import { AppService } from '../../../../app.service';
import { ProductService } from '../../product.service';
import { ShoppingCartService } from '../../../shopping-cart/shopping-cart.service';
import { TicketService } from '../../../ticket/ticket.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TicketChangeTypeComponent } from '../../../../@theme/entryComponents/changeType/changeType.component';
import { ChangeInputDto } from '../../../../@theme/entryComponents/changeType/changeType.service';
import { TicketChangeTypeService } from '../../../../@theme/entryComponents/changeType/changeType.service';
import { formatProducts } from '../../../../@core/utils/extend';
import { groupSame } from '../../../shopping-cart/shopping-cart.utils';

function groupToArray(groupProducts) {
  const items = [];
  groupProducts.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      // tslint:disable-next-line:variable-name
      const _item = JSON.parse(JSON.stringify(item));
      _item.count = 1;
      items.push(_item);
    }
  });
  return items;
}

@Component({
  selector: 'app-product-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  providers: [NzMessageService]
})
export class ProductPreviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() didEnter;
  seats;
  cinema = this.appSvc.currentCinema;
  cart;
  groupProducts;
  list = [];
  uidShopCartOri = '';
  open = false;
  subscribe;

  constructor(private router: Router,
              private zone: NgZone,
              private modalController: ModalController,
              private message: NzMessageService,
              private toastSvc: ToastService,
              public authSvc: AuthService,
              private appSvc: AppService,
              private changeTypeSvc: TicketChangeTypeService,
              private productSvc: ProductService,
              private ticketSvc: TicketService,
              private shoppingCartSvc: ShoppingCartService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.didEnter.currentValue !== changes.didEnter.previousValue && changes.didEnter.currentValue) {
      this.getData();
    }
  }

  ngOnInit() {
    this.subscribe = this.productSvc.getSelectedStatus().subscribe(res => {
      this.groupProducts = groupSame(res);
    });
  }

  toggleOpen() {
    this.open = !this.open;
  }

  getData() {
    this.getDetails();
  }

  getList() {
    this.shoppingCartSvc.list().subscribe(res => {
      this.list = res.data;
    });
  }

  getDetails() {
    this.shoppingCartSvc.details(this.uidShopCartOri).subscribe(res => {
      this.cart = res.data;
      if (this.cart) {
        let products = res.data.posShopCartResDTOList
          .filter(item => (item.cartResType === 0 || item.cartResType === 1 || item.cartResType === 4) && item.isPointsPay !== 1);
        products = formatProducts(products);
        this.groupProducts = groupSame(products);
        this.countChange();
        if (res.data.posShopCartPlanSeatDTOList.length === 0) {
          this.getList();
        }
      } else {
        this.getList();
        this.productSvc.updateSelectedStatus([]);
      }
    });
  }

  refreshTicket() {
    this.shoppingCartSvc.details(this.uidShopCartOri).subscribe(res => {
      this.cart = res.data;
    });
  }

  getSeats() {
    this.shoppingCartSvc.details(this.uidShopCartOri).subscribe(res => {
      this.cart = res.data;
    });
  }

  countChange() {
    const products = groupToArray(this.groupProducts);
    const selected = [];
    products.forEach(item => {
      const select = {};
      for (const key in item) {
        if (key !== 'count') {
          select[key] = item[key];
        }
      }
      selected.push(select);
    });
    this.productSvc.updateSelectedStatus(selected);
  }

  del(item, type) {
    if (type === 'seat') {
      this.delSeat(item);
    }
    if (type === 'product') {
      this.delProduct(item);
    }
  }

  async presentChangeModal(seat) {
    const currentSelected = this.ticketSvc.currentSelected;
    const selected: any = {};
    selected[seat.uidPosResSeat] = currentSelected[seat.uidPosResSeat];
    const info = this.ticketSvc.currentInfo;
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TicketChangeTypeComponent,
      componentProps: {ticketTypes: info.ticketTypeList, selected, buttonDismiss: true}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.changeType(seat, data);
    }
  }

  changeType(seat, ticketType) {
    const currentSelected = this.ticketSvc.currentSelected;
    const inputDto: ChangeInputDto = {
      cartSeatPriceService: seat.cartSeatPriceService,
      cartSeatPriceSupplyValue: seat.cartSeatPriceSupplyValue,
      namePayMode: seat.namePayMode,
      ticketName: ticketType.ticketTypeName,
      ticketPirce: (() => {
        const levelPrice = ticketType.levelPriceDTO.filter(item => {
          return currentSelected[seat.uidPosResSeat].resSeatLevelCode === item.seatLevelCode;
        })[0];
        return levelPrice.price;
      })(),
      uidCartPlanSeat: seat.uidPosResSeat,
      uidPayMode: seat.uidPayMode,
      uidTicketType: ticketType.uidTicketType
    };
    this.changeTypeSvc.change(inputDto).subscribe(res => {
      if (res.status.status === 0) {
        const selected = this.ticketSvc.currentSelected;
        for (const uid in selected) {
          if (uid === seat.uidPosResSeat) {
            selected[uid].ticketType = ticketType;
            selected[uid].levelPrice = ticketType.levelPriceDTO.filter(item => {
              return selected[uid].resSeatLevelCode === item.seatLevelCode;
            })[0];
          }
        }
        this.ticketSvc.updateSelectedStatus(selected);
        this.refreshTicket();
      }
    });
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
      this.getSeats();
    });
  }

  delProduct(i) {
    this.groupProducts.splice(i, 1);
    // this.productSvc.updateSelectedStatus(this.pro)
    this.countChange();
  }

  deletes() {// 解除销座
    const seatCodeList = [];
    let selected = this.ticketSvc.currentSelected;
    for (const key in selected) {
      if (selected[key]) {
        seatCodeList.push(selected[key].resSeatCode);
      }
    }
    this.toastSvc.loading('加载中...', 0);
    this.shoppingCartSvc.unlocks().subscribe(res => {
      this.toastSvc.hide();
      if (res.status && res.status.status === 0) {
        selected = {};
        // this.createBlankShoppingCart();
      }
      this.ticketSvc.updateSelectedStatus(selected);
      /*this.ticketHallSeatsComponent.refresh();*/
      this.getData();
    });
  }

  deleted(e) {
    this.getData();
  }

  submit() {
    if (this.appSvc.currentLoading) {
      return false;
    }
    if (this.groupProducts.length > 0 || (this.cart && this.cart.posShopCartPlanSeatDTOList.length > 0)) {
      const uidShopCart = this.shoppingCartSvc.currentCart;
      this.zone.run(() => {
        this.router.navigate(['/checkout/index'], {
          queryParams: {
            uidShopCart,
            businessType: 'SALE'
          }
        }).then();
      });
    } else {
      return false;
    }
  }

  created(e) {
    const selected = this.ticketSvc.currentSelected;
    const seats = [];
    for (const uid in selected) {
      if (selected[uid]) {
        seats.push(uid);
      }
    }
    if (seats.length > 0) {
      this.message.warning('已有影票不能挂单！');
      return false;
    }
    this.productSvc.updateSelectedStatus([]);
    this.getData();
  }

  changeCart(e) {
    this.uidShopCartOri = e;
    this.productSvc.updateSelectedStatus([]);
    this.getData();
  }

  view() {
    if (this.appSvc.currentLoading) {
      return false;
    }
    this.zone.run(() => {
      this.router.navigate(['/shoppingCart/index'], {
        queryParams: {
          target: 'product'
        }
      }).then();
    });
  }

  empty() {
    this.toastSvc.loading('清空中...', 0);
    this.shoppingCartSvc.emptyCart().subscribe(res => {
      this.shoppingCartSvc.createEmptyCart().then(() => {
        this.toastSvc.hide();
        this.productSvc.updateSelectedStatus([]);
        this.ticketSvc.updateSelectedStatus({});
        this.getData();
      });
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
