import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {LocationStrategy} from '@angular/common';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CheckoutCashComponent} from '../../entryComponents/cash/cash.component';
import {CheckoutMemberCardPayComponent} from '../../entryComponents/memberCard/pay/memberCardPay.component';
import {CheckoutUseCouponComponent} from '../../entryComponents/useCoupon/useCoupon.component';
import {CheckoutUseGroupCouponComponent} from '../../entryComponents/useGroupCoupon/useGroupCoupon.component';
import {CheckoutUseMemberCouponComponent} from '../../entryComponents/useMemberCoupon/useMemberCoupon.component';
import {MemberService} from '../../../../@theme/modules/member/member.service';
import {ShoppingCartService} from '../../../shopping-cart/shopping-cart.service';
import {CheckoutService} from '../../checkout.service';
import {TicketService} from '../../../ticket/ticket.service';
import {VoucherPrinter} from '../../../../@core/utils/voucher-printer';
import {ToastService} from '../../../../@theme/modules/toast';
import {AppService} from '../../../../app.service';
import {VipService} from '../../../vip/vip.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, timeout} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {getPaid} from '../../extands';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {getEntityValue, countMemberSeat} from '../../../../@theme/modules/member/member.extend';

@Component({
  selector: 'app-checkout-check2',
  templateUrl: './check.page.html',
  styleUrls: ['./check.page.scss'],
  providers: [NzMessageService]
})
export class CheckoutCheck2Page implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
