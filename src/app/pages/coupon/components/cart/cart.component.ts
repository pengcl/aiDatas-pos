import {Component, NgZone} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {ShoppingCartService} from '../../../shopping-cart/shopping-cart.service';
import {CouponService, TicketListInputDto} from '../../coupon.service';

@Component({
  selector: 'app-coupon-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CouponCartComponent {
  items: TicketListInputDto[] = this.couponService.currentSelected;

  constructor(private zone: NgZone,
              private router: Router, private shoppingCartSvc: ShoppingCartService, private couponService: CouponService) {
    couponService.getSelectedStatus().subscribe(res => {
      this.items = res;
    });
    router.events
    .subscribe((event) => {
      if (event instanceof NavigationEnd) { // 当导航成功结束时执行
        this.items = this.couponService.currentSelected;
      }
    });
  }

  create() {
    this.couponService.create(this.items).subscribe(res => {
      this.shoppingCartSvc.setCurrentCart(res.data.uid);
      this.zone.run(() => {
        this.router.navigate(['/checkout/index'], {queryParams: {uidShopCart: res.data.uid, businessType: 'TICKETSALE'}}).then();
      });
    });
  }

  remove(i) {
    const items = this.couponService.currentSelected;
    items.splice(i, 1);
    this.couponService.updateSelectedStatus(items);
  }

  clean() {
    this.couponService.updateSelectedStatus([]);
    this.shoppingCartSvc.reduction().subscribe();
  }
}
