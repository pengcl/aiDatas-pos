import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {groupSame} from '../../../../shopping-cart/shopping-cart.utils';

@Component({
  selector: 'app-sub-checkout-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class SubCheckoutCartPage implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('ionContent', {static: false}) private ionContent: any;
  @Input() detail;
  groupProduct = [];
  products = [];
  coupons = [];
  points = [];
  cards = [];
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
  constructor() {
  }

  ngAfterViewInit() {
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

  /*cartResType 0:普通商品,1:套餐,2:票券商品,3:会员卡商品,4:积分商品*/
  grouping() {
    this.initCount();
    const products = [];
    const coupons = [];
    const points = [];
    const cards = [];
    if (this.detail) {
      console.log(this.detail);
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
        this.count.ticket.total = this.count.ticket.total + item.cartSeatPriceOri + servicePrice;
        this.count.ticket.amount = this.count.ticket.amount + item.cartSeatPrice + item.cartSeatPriceService - supplyPrice;
        this.count.ticket.discount = this.count.ticket.total - this.count.ticket.amount;
      });
    }
    this.products = groupSame(products);
    this.coupons = groupSame(coupons);
    this.points = groupSame(points);
    this.cards = groupSame(cards);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.detail.currentValue) {
      this.grouping();
    }
  }

  get size() {
    const width = document.body.offsetWidth;
    let size = 3;
    if (width < 1400) {
      size = 4;
    }
    return size;
  }

  // 变更购物车取货，取餐方式

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
