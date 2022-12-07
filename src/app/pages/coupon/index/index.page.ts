import { Component } from '@angular/core';

@Component({
  selector: 'app-coupon-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss']
})
export class CouponIndexPage {

  didEnter = false;

  constructor() {
  }

  ionViewDidEnter() {
    this.didEnter = true;
  }

  ionViewDidLeave() {
    this.didEnter = false;
  }
}
