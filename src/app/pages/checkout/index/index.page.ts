import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastService } from '../../../@theme/modules/toast';
import { AppService } from '../../../app.service';
import { CheckoutService } from '../checkout.service';
import { LocationStrategy } from '@angular/common';
import { ShoppingCartService } from '../../shopping-cart/shopping-cart.service';
import { MemberService } from '../../../@theme/modules/member/member.service';
import { TicketService } from '../../ticket/ticket.service';
import { SubService } from '../../sub/sub.service';

import { MemberComponent } from '../../../@theme/modules/member/member.component';
import { IsOptionalPipe } from '../../../@theme/pipes/pipes.pipe';
import { getPaid } from '../extands';
import { getSelectedFromShoppingCart } from '../../ticket/index/components/hall/components/seats/seats.extend';

@Component({
  selector: 'app-checkout-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService, NzModalService, IsOptionalPipe]
})
export class CheckoutIndexPage implements OnInit {
  uidShopCart;
  detail;
  member;
  businessType = '';
  isExceptionBill: number; // 是否为异常单
  takeGoodsType = false;
  hideActivities;
  enableExcMemberChange = true;
  @ViewChild(MemberComponent, {static: false}) private memberComponent: MemberComponent;
  lockMessage = '当前订单已支付';

  constructor(private modalController: ModalController,
              private isOptionalPipe: IsOptionalPipe,
              private route: ActivatedRoute,
              private location: LocationStrategy,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private nzmodal: NzModalService,
              private memberSvc: MemberService,
              private appSvc: AppService,
              private shoppingCartSvc: ShoppingCartService,
              private ticketSvc: TicketService,
              private subSvc: SubService,
              private checkoutSvc: CheckoutService) {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    const queryParams = this.route.snapshot.queryParams;
    this.businessType = 'SALE';
    this.isExceptionBill = 0;
    this.enableExcMemberChange = true; // 刷新会员信息开关
    if (queryParams) {
      if (queryParams.uidShopCart) {
        this.uidShopCart = queryParams.uidShopCart;
      }
      if (queryParams.businessType) {
        this.businessType = queryParams.businessType;
      }
      if (queryParams.isExceptionBill) {
        this.isExceptionBill = queryParams.isExceptionBill;
      }
    }

    // console.log('ngOnInit-businessType-->', this.businessType);

    // 进入页面，用地址栏中购物车uid初始
    const initnotifier = 'init(check)';
    const detail: any = {};
    detail.uidShopCart = this.uidShopCart;
    detail.exceptionType = 'init';
    this.member = this.memberSvc.currentMember;
    const shopCartMsg = {
      notifier: initnotifier,
      detail,
      memberDetail: this.member
    };
    this.checkoutSvc.refreshShoppingcartDetail(shopCartMsg);

    const notifier = 'init(cart,acts,check)';
    this.initShoppingCart(notifier);
  }

  ionViewDidLeave() {
  }

  changeHideActivities(e) {
    setTimeout(() => {
      this.hideActivities = e;
    });
  }

  // 查询购物车详情
  // notifier：通知订阅购物车消息的组件
  initShoppingCart(notifier) {
    // console.log('发起查询购物车详情-->');
    const params: any = {};
    params.uidShopCart = this.uidShopCart;
    // this.shoppingCartSvc.details().subscribe(res => {
    this.checkoutSvc.queryShopCartDetail(params).subscribe(res => {
      // console.log('购物车详情-->', res.data);
      if (res.data){
        this.ticketSvc.updateReleaseTime(new Date(res.data.cartValidTime).getTime());
        this.detail = res.data;
        this.member = this.memberSvc.currentMember;
        const shopCartMsg = {
          notifier,
          detail: res.data,
          memberDetail: this.member
        };
        // console.log('refreshFromNotifier-->', notifier);
        if (this.ticketSvc.currentInfo) {
          const selected = getSelectedFromShoppingCart(res.data.posShopCartPlanSeatDTOList,
            this.ticketSvc.currentInfo.seatList,
            this.ticketSvc.currentInfo.ticketTypeList);
          this.ticketSvc.updateSelectedStatus(selected);
        }
        this.checkoutSvc.refreshShoppingcartDetail(shopCartMsg);
      }
    });
  }

  get locked() {// 会员锁
    return getPaid(this.detail).length > 0 && !this.appSvc.isSvcMixPay;
  }

  // 接收子组件请求刷新购物车事件
  // notifier：通知订阅购物车消息的组件
  refreshShoppingCard(notifier) {
    // console.log('收到刷新购物车事件-->');
    this.initShoppingCart(notifier);
  }

  memberChange(e) {
    if (this.enableExcMemberChange === false) {
      // console.log('不需刷新会员信息');
      return;
    }
    // console.log('收到会员登录信息变更消息');
    this.member = e;
    this.memberSvc.updateMemberStatus(this.member);
    this.checkTicketType();
    const shopCartMsg: any = {};
    shopCartMsg.memberDetail = this.member;
    const detail = this.detail;
    if (this.member && this.member.card) {
      // console.log('选中会员card', this.member.card);
      detail.uidMember = this.member.uid;
      detail.uidMemberCard = this.member.card.uidMemberCard;
      detail.uidMemberCardLevel = this.member.card.uidCardLevel;
      detail.memberCardLevelName = this.member.card.cardLevelName;
      detail.memberCardNo = this.member.card.cardNo;
      shopCartMsg.memberStatus = 'login';
      shopCartMsg.notifier = 'memberChange(acts,check)';
    } else {
      detail.uidMember = null;
      detail.uidMemberCard = null;
      detail.uidMemberCardLevel = null;
      detail.memberCardLevelName = null;
      detail.memberCardNo = null;
      shopCartMsg.memberStatus = 'logout';
      shopCartMsg.notifier = 'memberChange(acts)';
    }
    shopCartMsg.detail = detail;
    this.checkoutSvc.refreshShoppingcartDetail(shopCartMsg);
  }

  checkTicketType() {
    const selected = this.ticketSvc.currentSelected;
    for (const uid in selected) {
      if (selected[uid]) {
        const isOptional = this.isOptionalPipe.transform(selected[uid].ticketType, this.member);
        if (!isOptional) {
          selected[uid].ticketType = this.ticketSvc.currentInfo.ticketTypeList[0];
          selected[uid].levelPrice = this.ticketSvc.currentInfo.ticketTypeList[0].levelPriceDTO.filter(item => {
            return selected[uid].resSeatLevelCode === item.seatLevelCode;
          })[0];
        }
      }
    }
    this.ticketSvc.updateSelectedStatus(selected);
  }

  askForMember() {
    this.memberComponent.login();
  }

  askForLogout(e) {
    // console.log('askForLogout参数->', e);
    if (e) {
      this.enableExcMemberChange = e.enableExcMemberChange;
    }
    if (this.memberComponent) {
      this.memberComponent.clean();
    }
  }

}
