import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Output, EventEmitter, Input} from '@angular/core';
import {CheckoutService} from '../../checkout.service';
import {SubService} from '../../../sub/sub.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {groupSame} from '../../../shopping-cart/shopping-cart.utils';
import {ToastService} from '../../../../@theme/modules/toast';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-checkout-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CheckoutCartPage implements OnInit, OnDestroy, AfterViewInit {
  @Input() businessType;
  detail;
  groupProduct = [];
  shoppingCartInfoSubscribe;
  products = [];
  coupons = [];
  points = [];
  cards = [];
  @ViewChild('ionContent', {static: false}) private ionContent: any;
  @Input() takeGoodsType;
  @Output() takeGoodsTypeChange = new EventEmitter();
  @Output() askForHideActivities = new EventEmitter();
  count = {
    product: {
      total: 0,
      discount: 0,
      amount: 0,
      point: 0
    },
    ticket: {
      total: 0,
      discount: 0,
      amount: 0,
      point: 0
    },
    point: {
      total: 0,
      discount: 0,
      amount: 0,
      point: 0
    },
    coupon: {
      total: 0,
      discount: 0,
      amount: 0,
      point: 0
    },
    card: {
      total: 0,
      discount: 0,
      amount: 0,
      point: 0
    }
  };

  constructor(private checkoutSvc: CheckoutService,
              private subSvc: SubService,
              private toastSvc: ToastService,
              private message: NzMessageService,
              public authSvc: AuthService) {
  }

  ngAfterViewInit() {
  }

  get size() {
    const width = document.body.offsetWidth;
    let size = 3;
    if (width < 1400) {
      size = 4;
    }
    return size;
  }

  initCount() {
    this.count = {
      product: {
        total: 0,
        discount: 0,
        amount: 0,
        point: 0
      },
      ticket: {
        total: 0,
        discount: 0,
        amount: 0,
        point: 0
      },
      point: {
        total: 0,
        discount: 0,
        amount: 0,
        point: 0
      },
      coupon: {
        total: 0,
        discount: 0,
        amount: 0,
        point: 0
      },
      card: {
        total: 0,
        discount: 0,
        amount: 0,
        point: 0
      }
    };
  }

  counting(target, item) {
    if (target === 'point') {
      this.count[target].total = this.count[target].total + item.pointsChangePrice;
      this.count[target].amount = this.count[target].amount + item.pointsChangePrice;
      this.count[target].discount = this.count[target].total - this.count[target].amount;
      this.count[target].point = this.count[target].point + item.pointsChangePoints;
    } else {
      this.count[target].total = this.count[target].total + item.cartResPriceOri;
      this.count[target].amount = this.count[target].amount + item.cartResPrice;
      this.count[target].discount = this.count[target].total - this.count[target].amount;
    }
  }

  /*cartResType 0:普通商品,1:套餐,2:票券商品,3:会员卡商品,4:积分商品*/
  grouping() {
    this.initCount();
    const products = [];
    const coupons = [];
    const points = [];
    const cards = [];
    if (this.detail) {
      this.detail.posShopCartResDTOList.forEach(item => {
        if ((item.cartResType === 0 || item.cartResType === 1 || item.cartResType === 4) && item.isPointsPay !== 1) {
          products.push(item);
          this.counting('product', item);
        }
        if (item.cartResType === 2 && item.isPointsPay !== 1) {
          coupons.push(item);
          this.counting('coupon', item);
        }
        if (item.cartResType === 3 && item.isPointsPay !== 1) {
          cards.push(item);
          this.counting('card', item);
        }
        if (item.isPointsPay === 1) {
          points.push(item);
          this.counting('point', item);
        }
      });
      this.detail.posShopCartPlanSeatDTOList.forEach(item => {
        const servicePrice = item.acCartSeatPriceService ? item.acCartSeatPriceService : item.cartSeatPriceService;
        const supplyPrice = item.cartSeatPriceSupplyValue;
        const secondSupplyValue = item.secondSupplyValue ? item.secondSupplyValue : 0;
        this.count.ticket.total = this.count.ticket.total + item.cartSeatPriceOri + servicePrice;
        this.count.ticket.amount = this.count.ticket.amount + item.cartSeatPrice + item.cartSeatPriceService - supplyPrice - secondSupplyValue;
        this.count.ticket.discount = this.count.ticket.total - this.count.ticket.amount;
      });
    }
    this.products = groupSame(products);
    this.coupons = groupSame(coupons);
    this.points = groupSame(points);
    this.cards = groupSame(cards);
    if (points.length > 0) {
      this.askForHideActivities.next(true);
    }
  }

  // 变更购物车取货，取餐方式
  change(e) {
    let takeType = 0;
    if (e.detail.checked) {
      takeType = 2;
    }
    const takeGoodsTypeInfo: any = {};
    takeGoodsTypeInfo.takeType = takeType; // 必填取餐方式，0 ：正常下单，1 前台取餐，2.配餐
    takeGoodsTypeInfo.takeMobile = '';  // 取餐手机（可空）
    takeGoodsTypeInfo.takePosition = ''; // 取餐位置（可空）
    takeGoodsTypeInfo.takeTime = '';   // 取餐时间（可孔）

    const params: any = {};
    params.uidShopCart = this.detail.uidShopCart;
    params.takeGoodsTypeInfo = takeGoodsTypeInfo;
    this.toastSvc.loading('正在处理...', 0);
    this.checkoutSvc.changePosShopCartTakeGoodsType(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {// 成功
      } else {
        this.message.error('取餐设置失败，原因：' + res.status.msg2Client);
      }
    });
  }

  ngOnInit() {
    this.shoppingCartInfoSubscribe = this.checkoutSvc.getShoppingCartDetail().subscribe(res => {
      this.subSvc.updateSub('shoppingCart', res);
      if (res) {
        if (res.notifier && res.notifier.indexOf('cart') !== -1) {
          // console.log('cart-刷新购物车数据');
          this.detail = res.detail;
          this.grouping();
        } else {
          // console.log('cart-不需刷新购物车数据');
        }
      } else {
        // console.log('刷新购物车数据失败');
        this.resetData();
        this.grouping();
      }
    });
  }

  // 初始化数据
  resetData() {
    this.detail = null;
    this.grouping();
  }

  ngOnDestroy() {
    if (this.shoppingCartInfoSubscribe) {
      this.resetData();
      this.shoppingCartInfoSubscribe.unsubscribe();
    }
  }
}
