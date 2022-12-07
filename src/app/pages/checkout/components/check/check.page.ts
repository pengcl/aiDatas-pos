import {Component, OnInit, OnDestroy, EventEmitter, Input, Output} from '@angular/core';
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
import {SubService} from '../../../sub/sub.service';
import {VipService} from '../../../vip/vip.service';
import {HttpClient} from '@angular/common/http';
import {timeout} from 'rxjs/operators';
import {getPaid} from '../../extands';

import {getEntityValue, countMemberSeat} from '../../../../@theme/modules/member/member.extend';

@Component({
  selector: 'app-checkout-check',
  templateUrl: './check.page.html',
  styleUrls: ['./check.page.scss'],
  providers: [NzMessageService]
})
export class CheckoutCheckPage implements OnInit, OnDestroy {
  @Input() businessType;
  @Input() isExceptionBill: number;  // 是否为异常单
  @Input() takeGoodsType;
  @Output() refreshShoppingCardEvent: EventEmitter<any> = new EventEmitter();
  @Output() askForMember: EventEmitter<any> = new EventEmitter();
  @Output() askForLogout: EventEmitter<any> = new EventEmitter();
  @Output() askForLeave: EventEmitter<any> = new EventEmitter();
  shopCardDetail;
  memberDetail;
  // 已支付记录
  payDetails;
  // 可用支付方式
  payTypes;
  paymentAmont; // 已支付
  shoppingCartInfoSubscribe;
  isMore = false; // 显示更多支付方式
  memberAsked: any = ''; // 是否请求登录
  disabled = false;
  loading = false;
  enableQrCode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private location: LocationStrategy,
    private toastSvc: ToastService,
    private message: NzMessageService,
    private nzmodal: NzModalService,
    private shoppingCartSvc: ShoppingCartService,
    private memberSvc: MemberService,
    private checkoutSvc: CheckoutService,
    private ticketSvc: TicketService,
    private voucherPrinter: VoucherPrinter,
    private vipSvc: VipService,
    private appSvc: AppService,
    private subSvc: SubService,
    private http: HttpClient) {
  }


  ngOnInit() {
    this.checkQrCodeInfo();
    this.checkoutSvc.getPayType({isPaySupply: 0}).subscribe(res => {
      // console.log('返回支付方式', res.data);
      this.payTypes = res.data;
    });
    this.shoppingCartInfoSubscribe = this.checkoutSvc.getShoppingCartDetail().subscribe(res => {
      if (res) {
        // console.log(res);
        if (res.notifier && res.notifier.indexOf('check') !== -1) {
          this.shopCardDetail = res.detail;
          if (res.detail.exceptionType && res.detail.exceptionType === 'init') {
            // console.log('初始化shopCardDetail');
          } else {
            this.memberDetail = res.memberDetail;
            const reducePoints = this.shopCardDetail ? this.shopCardDetail.redunctPoints : 0;
            console.log('memberDetail', this.memberDetail);
            // const memberPoints = this.memberDetail ? this.memberDetail.memberPoints : 0;
            // this.disabled = reducePoints > memberPoints;
            let cardPoint = 0;
            if (this.memberDetail &&  this.memberDetail.card){
              cardPoint = this.memberDetail.card.cardPoint;
            }
            this.disabled = reducePoints > cardPoint;
            if (this.memberDetail && this.memberAsked) {
              if (this.memberAsked.type === 'pay') {
                this.paySelect(this.memberAsked.data);
              }
              if (this.memberAsked.type === 'coupon') {
                this.userCoupon(this.memberAsked.data);
              }
              this.memberAsked = '';
            }
            this.setPayment();
          }
          // console.log('check-刷新购物车数据', this.shopCardDetail);
        } else {
          // console.log('check-不需刷新购物车数据');
        }
      } else {
        // console.log('获取购物车数据失败');
        this.resetData();
      }
    });
  }

  checkQrCodeInfo(){
    const cart = this.shoppingCartSvc.checkShoppingCart();
    if (cart.seats.length > 0){
      this.enableQrCode = false;
      const url = this.appSvc.currentCinema.codeUrl + encodeURIComponent('0021211018224653000000000000000400110331202100212021101800142021-10-18T21:40:0000000401_##8_##9040.00000.00');
      this.http.get(url, {responseType: 'text'})
        .pipe(timeout(5000))
        .subscribe(
          res => {
            res = decodeURIComponent(res);
            if (res.length === 172 || res.length === 180) {
              this.enableQrCode = true;
            }
          },
          error => {
            this.enableQrCode = false;
          });
    }
  }

  // 初始化数据
  resetData() {
    this.shopCardDetail = null;
    this.setPayment();
  }

  more() {
    this.isMore = !this.isMore;
  }

  // 已支付记录
  setPayment() {
    // console.log('checkt_执行刷新支付记录');
    this.payDetails = getPaid(this.shopCardDetail);
    this.subSvc.updateSub('payDetails', this.payDetails);
  }

  get types(): any {
    if (!this.payTypes) {
      return null;
    }
    if (this.businessType === 'SALE') {
      const card = this.memberDetail ? this.memberDetail.card : null; // 会员卡;
      const storedValueCard = card ? card.cardLevelType === 0 : false; // 是否储值卡;
      if (this.appSvc.isBalancePay && storedValueCard) {
        return this.payTypes.filter(item => item.modeCode === 'MemberCard');
      }
      return this.payTypes;
    } else {
      return this.getRechargePayTypeList(this.payTypes);
    }
  }

  // 获取充值支付方式
  getRechargePayTypeList(payTypes) {
    const rechargePayTypeList = [];
    if (payTypes && payTypes.length > 0) {
      for (const item of payTypes) {
        if (item.modeCode === 'MemberCard' || item.modeCode === 'MemberPoints'
          || item.modeCode === 'Coupon' || item.modeCode === 'GroupPay') {
          continue;
        }
        rechargePayTypeList.push(item);
        // console.log('item.payModeCode', item.modeCode);
      }
    }
    return rechargePayTypeList;
  }

  // 删除已支付记录
  deletePay(payment) {
    // console.log('接收删除支付事件,调用删除支付接口', payment);
    const shopCardDetail = this.shopCardDetail;
    if (payment.payModeCode === 'coupon') {
      const params: any = {};
      params.uidShopCart = shopCardDetail.uidShopCart;
      params.ticketCode = payment.ticketCode;
      this.toastSvc.loading('正在处理...', 0);
      this.checkoutSvc.delTicket(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0 && res.data) {
          const notifier = 'delCouponPay(cart,act_payment,check)';
          this.refreshShoppingCardEvent.emit(notifier);
        } else {
          // console.log('失败');
        }
      });
    } else {
      const params: any = {};
      params.uidShopCart = this.shoppingCartSvc.currentCart;
      params.uidPosPay = payment.uid;
      this.toastSvc.loading('正在处理...', 0);
      this.checkoutSvc.delPayment(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {// 成功
          if (payment.payModeCode === 'MemberCard') {
            this.printMemberPayment(shopCardDetail.uidComp, shopCardDetail.uidPosBill, 'T00205', 'refund');
          }
          const notifier = 'delPay(cart,act_payment,check)';
          this.refreshShoppingCardEvent.emit(notifier);
        } else {
          // console.log('删除已支付记录');
        }
      });
    }

  }

  hasPay() {
    let flag = false;
    const payDetails = this.payDetails;
    if (payDetails && payDetails.length > 0) {
      for (const item of payDetails) {
        if (item.payModeCode === 'MemberPoints') {
          continue;
        }
        flag = true;
      }
    }
    return flag;
  }

  // 是否已有票券之外的支付
  hasOtherPayExcludeCoupon() {
    let flag = false;
    const payDetails = this.payDetails;
    if (payDetails && payDetails.length > 0) {
      for (const item of payDetails) {
        if (item.payModeCode !== 'coupon') {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

  // 使用票券
  userCoupon(couponType) {
    if (this.hasOtherPayExcludeCoupon()) {
      this.message.warning('订单已支付，不允许再添加票券');
      return;
    }
    this.couponPresentModal(couponType).then();
  }

  // 使用票券弹窗
  async couponPresentModal(couponType) {
    const params: any = {};
    params.shopCardDetail = this.shopCardDetail;
    let component;
    if (couponType === 'coupon') {
      component = CheckoutUseCouponComponent;
    } else if (couponType === 'groupCoupon') {
      component = CheckoutUseGroupCouponComponent;
    } else if (couponType === 'memberCoupon') {
      if (this.memberDetail === null || this.memberDetail === undefined) {
        // this.message.warning('请先登录会员');
        this.askForMember.next(true);
        this.memberAsked = {type: 'coupon', data: couponType};
        return;
      }
      params.memberMobile = this.memberDetail.memberMobile;
      component = CheckoutUseMemberCouponComponent;
    } else {
      return;
    }
    // console.log('票券弹窗参数', params);
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component,
      componentProps: {params},
      cssClass: 'full-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      // console.log('接收票券支付返回参数', data);
      if (data.billStatus === 'compelete') {
        // console.log('订单完成');
        const saveBillResult = data.saveBillResult;
        if (saveBillResult.status.status === 0) {
          const payRes = saveBillResult.data;
          if (payRes.needPay === 0) {
            this.message.success('订单完成，正在打印', {nzDuration: 3000});
            this.billCompelete(payRes.uidPosBill);
          } else if (payRes.needPay === 1) {
            const notifier = 'pay(cart,act_payment,check)';
            this.refreshShoppingCardEvent.emit(notifier);
          }
        } else if (saveBillResult.status.status === 29000) {
          // 重复下单，返回订单已完成状态
          const payRes = saveBillResult.data;
          this.billCompelete(payRes.uidPosBill);
        }
      } else {
        // console.log('票券支付中');
        const notifier = 'couponUse(cart,act_payment,check)';
        this.refreshShoppingCardEvent.emit(notifier);
      }
    }
  }


  // 支付确认订单
  paySelect(payType) {
    console.log('payType');
    if (this.loading) {
      return false;
    }
    this.loading = true;
    // console.log('选择支付', payType);
    // 没有需要结算的商品
    if (this.disabled) {
      this.loading = false;
      this.message.error('当前会员卡积分不足，请取消可能消耗积分的活动！');
      this.loading = false;
      return false;
    }
    const memberSeatCount = countMemberSeat(this.ticketSvc.currentSelected);
    if (memberSeatCount) {
      const card = this.memberSvc.currentMember.card;
      const dayLimit = Number(getEntityValue(card.cardParamEntityList, 'dayLimit')); // 当日限购数量
      const sceneLimit = Number(getEntityValue(card.cardParamEntityList, 'salesLimit')); // 当前场次限购数量
      const countToday = Number(card.totalSaleTicketCountToday);
      if (dayLimit > 0 && countToday + memberSeatCount > dayLimit) {
        this.message.error('当前会员卡购票已超出每日限购折扣票数，无法继续使用优惠。');
        return false;
      }
      this.payPresentModal(payType).then(() => {
        this.loading = false;
      });
      // todo:只是保险而以，暂时取消;
      /*this.memberSvc.sceneCount( this.memberDetail.card.uidMemberCard,  this.memberDetail.card.uidCardLevel,
          this.memberDetail.card.cardNo, this.ticketSvc.currentInfo)
      .subscribe(res => {
        const sceneCount = Number(res.data); // 当前场次使用次数
        if (sceneLimit > 0 && sceneCount + memberSeatCount > sceneLimit) {
          this.message.error('当前会员卡购票已超出当场限购折扣票数，无法继续使用折扣。');
          return false;
        }
        this.payPresentModal(payType).then(() => {
          this.loading = false;
        });
      });*/
    } else {
      this.payPresentModal(payType).then(() => {
        this.loading = false;
      });
    }

  }

  checkDayLimit() {
  }

  // 选择支付方式弹窗
  async payPresentModal(payType) {
    const mode = payType.modeCode;
    const params: any = {};
    params.modeCode = payType.modeCode;
    params.modeName = payType.modeName;
    params.businessType = this.businessType;
    params.uidShopCart = this.shopCardDetail.uidShopCart;
    params.priceWillIncome = this.shopCardDetail.priceWillIncome;
    params.takeGoodsType = this.takeGoodsType ? '1' : '0';
    let component;
    console.log(mode);
    if (mode === 'MemberCard') {
      if (this.memberDetail === null || this.memberDetail === undefined) {
        this.askForMember.next(true);
        this.memberAsked = {type: 'pay', data: payType};
        return;
      }
      params.memberDetail = this.memberDetail;
      params.rechargePayTypeList = this.getRechargePayTypeList(this.payTypes);
      params.hasPay = this.hasPay();
      params.payDetails = this.payDetails;
      component = CheckoutMemberCardPayComponent;
    } else if (mode === 'MemberPoints') {
      if (this.memberDetail === null || this.memberDetail === undefined) {
        this.askForMember.next(true);
        this.memberAsked = {type: 'pay', data: payType};
        return;
      }
      component = CheckoutCashComponent;
    } else {
      component = CheckoutCashComponent;
    }
    // console.log('选择支付方式参数', params);
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component,
      componentProps: {params},
      cssClass: 'checkout-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      const saveBillResult = data.saveBillResult;
      if (saveBillResult.status.status === 0) {// 成功
        const payRes = saveBillResult.data;
        if (payRes.needPay === 0) {
          this.message.success('订单完成，正在打印', {nzDuration: 3000});
          this.billCompelete(saveBillResult.data.uidPosBill);
        } else if (payRes.needPay === 1) {
          const notifier = 'pay(cart,act_payment,check)';
          this.refreshShoppingCardEvent.emit(notifier);
        }
        if (payType.modeCode === 'MemberCard') {
          this.printMemberPayment(this.shopCardDetail.uidComp, payRes.uidPosBillPay, 'T00205', 'consume');
        }
      } else if (saveBillResult.status.status === 29000) {
        // 重复下单，返回订单已完成状态
        this.billCompelete(saveBillResult.data.uidPosBill);
      }
    }
  }

  updateMember() {
    if (!this.memberSvc.currentMember || (this.shopCardDetail.memberCardNo !== this.memberSvc.currentCard.cardNo)) {
      // 会员不存在或者充值卡和法前会员卡不同，不刷新会员数据
      return false;
    }
    const body = {
      cardType: 1,
      conditions: this.memberSvc.currentCard.cardNo
    };
    this.memberSvc.login(body).subscribe(res => {
      this.memberSvc.setMember(res.data, res.data.memberReCardDTOs[0]).subscribe();
    });
  }

  // 订单结算成功，开始其他逻辑处理
  billCompelete(uidPosBill) {
    // console.log('订单结算成功，开始其他逻辑处理，然后关闭页面');
    const cartDetial = this.shopCardDetail;
    const billSaleType = cartDetial.billSaleType;
    if (uidPosBill) {
      if (billSaleType === 'SALE') {
        // console.log('影票，卖品等支付完成，打印电影票，向外发出事件,如通知主界面刷新座位图，创建新的购物车');
        // this.ticketSvc.updateForceFreshStatus(true);
        this.printTicket(uidPosBill, cartDetial);
      } else if (billSaleType === 'MEMBER') {
        // console.log('会员业务支付完成，向外发出事件');
        this.printMemberBussinessTicket(uidPosBill, cartDetial);
        this.vipSvc.updateFreshStatus({caller: 'billCompelete', memberParams: {}});
        this.updateMember();
      }
    }
    this.shoppingCartSvc.createEmptyCart().then(() => {
      this.shoppingCartSvc.clear();
      this.askForLogout.next({enableExcMemberChange: false});
      const target = this.route.snapshot.queryParams.target;
      if (target) {
        this.router.navigate([target]).then();
      } else {
        if (billSaleType === 'MEMBER') {
          if (this.route.snapshot.queryParams.vip === 'true') {
            this.location.back();
          } else {
            this.router.navigate(['/vip/index'], {queryParams: {cardNo: this.shopCardDetail.memberCardNo}}).then();
          }
        } else {
          this.location.back();
        }
      }
    });
  }

  // 打印影票和小票
  printTicket(uidPosBill, cartDetial) {
    this.message.remove();
    this.message.success('订单完成，正在打印', {nzDuration: 20000});
    // console.log('打印影票和小票');
    const uidComp = cartDetial.uidComp;
    const posShopCartPlanSeatDTOList = cartDetial.posShopCartPlanSeatDTOList;
    let printTicketLen = 0;
    let billHaveGoods = '';
    const tasks = [];
    let hasTicket = false;
    if (posShopCartPlanSeatDTOList && posShopCartPlanSeatDTOList.length > 0) {
      for (const seat of posShopCartPlanSeatDTOList) {
        if (seat.uid === 'priceSupplyInfo' || seat.uid === 'priceServiceInfo') {
          // console.log('不是影票');
        } else {
          printTicketLen++;
        }
      }
      // console.log('printTicketLen-->', printTicketLen);
      // 影票打印
      tasks.push({uidComp, uidBill: uidPosBill, typeCode: 'T001'});
      billHaveGoods = 'ticket';
      hasTicket = true;
    }
    if (cartDetial.posShopCartResDTOList && cartDetial.posShopCartResDTOList.length > 0) {
      if (billHaveGoods === 'ticket') {
        billHaveGoods = 'ticket_and_mer';
      } else {
        billHaveGoods = 'mer';
      }
    }
    if (billHaveGoods !== '') {
      // 影票交易小票
      tasks.push({
        uidComp,
        uidBill: uidPosBill,
        typeCode: 'T00206',
        typeCodePrint: 'jiaoyixipiao',
        billHaveGoods
      });
    }
    if (tasks && tasks.length > 0) {
      // 判断有影票且是模式2
      if (hasTicket && this.appSvc.currentCinema.dockingType === '3') {
        if (this.enableQrCode){
          // 获取影票信息码
          this.getTicketCodeInfo(tasks, uidComp, uidPosBill);
        }else{
          // 打印程序
          this.printTask(tasks, uidComp, uidPosBill);
        }
      } else {
        // 打印程序
        this.printTask(tasks, uidComp, uidPosBill);
      }
    }
  }

  // 获取影票信息串
  getTicketCodeInfo(tasks, uidComp, uidPosBill) {
    const params = {uidPosBill};
    this.toastSvc.hide();
    this.toastSvc.loading('正在处理...', 0);
    this.checkoutSvc.getTicketCodeInfo(params).subscribe(res => {
      this.toastSvc.hide();
      // console.log('获取影票信息码串=>');
      // console.log(res);
      if (res.status.status === 0) {// 成功
        const datas = res.data;
        const size = datas.length;
        this.invoke(0, size, datas, tasks, uidComp, uidPosBill);
      } else {
        this.message.error('获取影票信息失败');
      }
    });
  }

  // 获取影票信息码
  invoke(index, size, datas, tasks, uidComp, uidPosBill) {
    if (index >= size) {
      // 修改影票信息码
      this.updateTicketCodeInfo(datas, tasks, uidComp, uidPosBill);
      return;
    }
    const d = datas[index];
    const url = this.appSvc.currentCinema.codeUrl + encodeURIComponent(d.infoParams);
    // console.log('获取影院影票信息码地址-->' + url);
    this.toastSvc.hide();
    this.toastSvc.loading('正在处理...', 0);
    this.http.get(url, {responseType: 'text'})
    .pipe(timeout(5000))
    .subscribe(
      res => {
        // console.log('获取影院影票信息码地址,返回结果--> ' + res);
        res = decodeURIComponent(res);
        if (res.length === 172 || res.length === 180) {
          if (res.length === 172) {
            d.ticketCodeInfo = this.appSvc.currentCinema.cinemaCode + res;
            d.msg = '成功';
          } else {
            const cCode = res.substring(0, 8);
            if (cCode === this.appSvc.currentCinema.cinemaCode) {
              d.ticketCodeInfo = res;
              d.msg = '成功';
            } else {
              d.ticketCodeInfo = '';
              d.msg = '二维码信息不正确' + res;
            }
          }
        } else {
          d.ticketCodeInfo = '';
          d.msg = '二维码信息长度不够' + res;
        }
        index = index + 1;
        this.invoke(index, size, datas, tasks, uidComp, uidPosBill);
      },
      error => {
        // console.log('获取影院影票信息码失败');
        d.ticketCodeInfo = '';
        d.msg = '失败:(' + error.statusText + ')' + url;
        index = index + 1;
        this.invoke(index, size, datas, tasks, uidComp, uidPosBill);
      });
  }

  // 修改影票信息码
  updateTicketCodeInfo(datas, tasks, uidComp, uidPosBill) {
    // console.log(datas);
    this.toastSvc.hide();
    this.toastSvc.loading('正在处理...', 0);
    this.checkoutSvc.updateTicketCodeInfo(datas).subscribe(res => {
      this.toastSvc.hide();
      this.printTask(tasks, uidComp, uidPosBill);
    });
  }

  // 打印会员业务小票
  printMemberBussinessTicket(uidPosBill, cartDetial) {
    this.message.remove();
    this.message.success('订单完成，正在打印', {nzDuration: 20000});
    // console.log('打印会员业务小票');
    const uidComp = cartDetial.uidComp;
    const tasks = [];
    const paramData: any = {};
    paramData.uidBill = uidPosBill;
    paramData.uidComp = uidComp;
    const posShopCartResDTOList = cartDetial.posShopCartResDTOList;
    if (posShopCartResDTOList && posShopCartResDTOList.length > 0) {
      for (const resDto of posShopCartResDTOList) {
        if (resDto.cartResCode === 'memCardNewRecharge') {
          paramData.typeCode = 'T00201'; // 开卡凭证
          paramData.dicCode = 'printAcCert';
          tasks.push(paramData);
        } else if (resDto.cartResCode === 'memCardRecharge') {
          paramData.typeCode = 'T00202'; // 充值
          paramData.dicCode = 'printCharCert';
          tasks.push(paramData);
        } else if (resDto.cartResCode === 'memCardCancel') {
          paramData.typeCode = 'T00204'; // 销卡
          paramData.dicCode = 'printPcCert'; // 销卡编码
          tasks.push(paramData);
        } else if (resDto.cartResCode === 'memCardRepair') {
          paramData.typeCode = 'T00210'; // 补卡
          paramData.dicCode = 'printSucCert';
          tasks.push(paramData);
        }
      }
      // console.log('打印tasks-->', tasks);
      if (tasks.length > 0) {
        this.printTask(tasks, uidComp, uidPosBill);
      }
    }
  }

  // 打印影票
  printTask(tasks, uidComp, uidPosBill) {
    this.message.remove();
    this.toastSvc.hide();
    let notifyPrintTicket = false;
    let takseLens = tasks.length;
    // console.log('打印任务数takseLens：-->', takseLens);
    this.voucherPrinter.printTask(tasks, (printResult) => {
      takseLens = takseLens - 1;
      // console.log('打印结果:', printResult);
      // console.log('还剩打印任务数:', takseLens);
      if (printResult.status === '0') {
        if (printResult.typeCode === 'T001') {
          if (!notifyPrintTicket) {
            this.completTakeTicket(uidComp, uidPosBill);  // 通知后台已经打印过影票
            notifyPrintTicket = true;
          }
        }
      } else if (printResult.status === '-1') {
        // console.log('后台设置不需打印');
      } else {
        const msg = '打印失败：' + printResult.msg;
        // console.log(msg);
      }
    });
  }

  // 通知后台打印过影票
  completTakeTicket(uidComp, uidPosBill) {
    // console.log('通知后台已经打印过影票--》');
    this.checkoutSvc.completTakePrintTicket({uidComp, uidPosBill}).subscribe(res => {
    });
  }

  // 打印支付方式小票
  printMemberPayment(uidComp, uidPosBill, typeCode, consumeOrRefund) {
    // console.log('打印会员支付方式小票');
    const parmas: any = {};
    parmas.uidComp = uidComp;
    parmas.uidBill = uidPosBill;
    parmas.typeCode = typeCode; // 支付小票
    if (typeCode === 'T00205') {
      if (consumeOrRefund === 'refund') {
        parmas.dicCode = 'printRefCert';	// 支付凭证
      } else {
        parmas.dicCode = 'printConCert';			// 退款凭证
      }
    }
    const methodName = '/printTempletService-api/templetPrint/print';
    this.voucherPrinter.print(parmas, methodName, (res) => {
      if (res.status === '0') {
        // console.log('打印成功');
      } else {
        // console.log('打印失败', res.msg);
      }
    });

  }

  // 取消，返回主页面
  cancelAndGoBack() {
    if (this.hasPay()) {
      this.message.warning('订单已有支付，请删除支付记录后再取消');
      return;
    }
    this.nzmodal.confirm({
      nzTitle: '确定取消订单',
      nzContent: '',
      nzOkText: '确定',
      nzCancelText: '取消',
      nzOkType: 'primary',
      // nzOkDanger: true,
      nzOnOk: () => {
        this.cancelShopcart();
      },
      nzOnCancel: () => {
      }
    });
  }

  // 艾德开发机器  下午 7:42:10
  cancelShopcart() {
    // console.log('isExceptionBill-->', this.isExceptionBill);
    const cartDetial = this.shopCardDetail;
    if (cartDetial) {
      const params: any = {};
      params.uidShopCart = cartDetial.uidShopCart;
      params.shopcartOperate = 0; // 还原购物车
      if (cartDetial.uidPosBill) {
        params.uidPosBill = cartDetial.uidPosBill;
      }
      if (this.isExceptionBill === 1) {
        params.shopcartOperate = 1;
        // console.log('异常单删除购物车');
      }
      console.log('params-->', params);
      this.toastSvc.loading('正在处理...', 0);
      this.checkoutSvc.cancelNotCompleteBill(params).subscribe(res => {
        this.toastSvc.hide();
        // console.log(res.status.status);
        if (res.status.status === 0) {// 成功
          this.location.back();
        } else if (res.status.status === 29000) {
          // this.billCompelete(res.data); // 注释不打印
          this.location.back();
        } else {
          // console.log('取消失败');
        }
      });
    } else {
      this.location.back();
    }
  }

  ngOnDestroy() {
    if (this.shoppingCartInfoSubscribe) {
      // console.log('ngOnDestroy');
      this.resetData();
      this.shoppingCartInfoSubscribe.unsubscribe();
    }
  }

}
