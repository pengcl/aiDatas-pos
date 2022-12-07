import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../../@theme/modules/toast';
import {PasswordService} from '../../../../../@theme/modules/password';
import {AppService} from '../../../../../app.service';
import {CheckoutService} from '../../../checkout.service';
import {CheckoutMemberCardRechargeComponent} from '../recharge/recharge.component';
import {CheckoutMemberCardCardComponent} from '../card/card.component';
import {CheckAuth} from '../../../../../@core/utils/check-auth';
import {ResetPasswordComponent} from '../../../../../@theme/entryComponents/reset/reset.component';

@Component({
  selector: 'app-checkout-memberCardPay',
  templateUrl: './memberCardPay.component.html',
  styleUrls: ['../../../../../../theme/ion-modal.scss', './memberCardPay.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class CheckoutMemberCardPayComponent {
  modalParams;
  memberDetail;
  cardSelected;
  payType = '';
  priceWillIncome = 0;  // 应收金额
  payAmount: any = '';   // 支付金额
  rechargePayTypeList;
  loading = {
    confirm: false,
    password: false,
    change: false,
    recharge: false
  };

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private passwordSvc: PasswordService,
              private appSvc: AppService,
              private checkAuth: CheckAuth,
              private checkoutSvc: CheckoutService
  ) {
    const modalParams = this.navParams.data.params;
    // console.log('params', modalParams);
    this.modalParams = modalParams;
    this.payType = modalParams.modeCode;
    this.priceWillIncome = modalParams.priceWillIncome;
    this.payAmount = modalParams.priceWillIncome;
    const memberDetail = modalParams.memberDetail;
    if (memberDetail.memberReCardDTOs && memberDetail.memberReCardDTOs.length > 0) {
      memberDetail.cardSelected = memberDetail.card;
      this.cardSelected = memberDetail.card;
    }
    this.memberDetail = memberDetail;
    this.rechargePayTypeList = modalParams.rechargePayTypeList;

  }

  change(e) {
    console.log(e);

  }

  // 确认下单
  confirm() {
    if (this.loading.confirm) {
      return false;
    }
    this.loading.confirm = true;
    if (!this.appSvc.isMixPay && this.priceWillIncome > this.payAmount) {
      this.message.warning('不允许混合支付，请一次支付完成！', {nzDuration: 3000});
      return false;
    }
    const hasCardPaid = this.modalParams.payDetails.filter(item => item.payModeCode === 'MemberCard').length > 0;
    if (hasCardPaid && !this.appSvc.isSvcMixPay) {
      this.message.error('不允许多张会员卡支付，请更换其它支付方式!');
      return false;
    }
    const memberCard = this.cardSelected;
    const payAmount = this.payAmount;
    if (payAmount === '') {
      this.message.warning('支付金额不能为空');
      return;
    } else {
      if (isNaN(Number(payAmount))) {
        this.message.warning('支付金额需大于等于0');
        return;
      } else {
        if (memberCard.reCardStatus !== 0) {
          this.message.warning('会员卡处于失效状态，不能支付');
          return;
        }
        if (memberCard.overdue === 1) {
          this.message.warning('会员卡已过期，不能支付');
          return;
        }
        const payMoney = Number(payAmount);
        if (payMoney > this.priceWillIncome) {
          this.message.warning('支付金额不能大于订单金额');
          return;
        }
        if (payMoney > 0) {
          if (memberCard.cardLevelType === 0) {
            if (memberCard.totalCash <= 0) {
              this.message.warning('会员卡余额不足，请及时充值');
              return;
            }
          } else {
            this.message.warning('订单金额大于0，请使用储值卡支付');
            return;
          }
        }
      }
    }
    this.passwordSvc.show().subscribe(passWord => {
      this.loading.confirm = false;
      if (!passWord) {
        return false;
      }
      const paymemnt: any = {};
      paymemnt.payAmount = Number(this.payAmount);
      paymemnt.payModeCode = this.modalParams.modeCode;
      const memberInfo: any = {};  // 会员支付
      memberInfo.memberCinemaCode = memberCard.cinemaCode;
      memberInfo.memberCardNo = memberCard.cardNo;
      memberInfo.passWord = passWord;

      const saveBillParams: any = {
        uidShopCart: this.modalParams.uidShopCart,
        billSaleType: this.modalParams.businessType,
        takeGoodsType: this.modalParams.takeGoodsType,
        memberInfo,
        payment: paymemnt,
        paymentList: [paymemnt]
      };
      saveBillParams.notErrorInterceptor = true;
      // console.log('saveBillParams-->', saveBillParams);
      this.toastSvc.loading('正在处理...', 0);
      this.checkoutSvc.saveBill(saveBillParams).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {// 成功
          const data: any = {};
          data.saveBillParams = saveBillParams;
          data.saveBillResult = res;
          this.modalController.dismiss(data).then();
        } else if (res.status.status === 29000) {
          const data: any = {};
          data.saveBillParams = saveBillParams;
          data.saveBillResult = res;
          this.modalController.dismiss(data).then();
        } else {
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  // 取消操作
  dismiss() {
    this.modalController.dismiss().then();
  }

  // 切换卡
  changeCard() {
    if (this.loading.change) {
      return false;
    }
    this.loading.change = true;
    const hasCardPaid = this.modalParams.payDetails.filter(item => item.payModeCode === 'MemberCard').length > 0;
    if (hasCardPaid && !this.appSvc.isSvcMixPay) {
      this.message.error('不允许多张会员卡支付，请更换其它支付方式!');
      return false;
    }
    this.changeCardPresentModal().then(() => {
      this.loading.change = false;
    });
  }

  async changeCardPresentModal() {
    const params: any = {};
    params.memberDetail = this.memberDetail;
    const component = CheckoutMemberCardCardComponent;
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component,
      componentProps: {params}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      console.log('接收返回卡');
      this.cardSelected = data;
      this.memberDetail.cardSelected = data;
    }
  }

  // 充值
  recharge() {
    if (this.loading.recharge) {
      return false;
    }
    this.loading.recharge = true;
    const memberCard = this.cardSelected;
    if (memberCard.reCardStatus !== 0) {
      this.message.warning('会员卡处于失效状态，不能充值');
      return;
    }
    if (memberCard.overdue === 1) {
      this.message.warning('会员卡已过期，不能充值');
      return;
    }
    if (memberCard.cardLevelType !== 0) {
      this.message.warning('不是储蓄卡，不能充值');
      return;
    }
    this.rechargePresentModal().then(() => {
      this.loading.recharge = false;
    });
  }

  // 充值
  async rechargePresentModal() {
    const params: any = {};
    params.memberDetail = this.memberDetail;
    params.rechargePayTypeList = this.rechargePayTypeList;
    // console.log('params参数', params);
    const component = CheckoutMemberCardRechargeComponent;
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
      console.log('充值结果返回查询');
      this.memberQuery();
    }
  }

  memberQuery() {
    const memberDetail = this.memberDetail;
    const cardSelected = memberDetail.cardSelected;
    const params: any = {
      bussinessType: '1',
      cardType: 1,
      uidMember: memberDetail.uid,
      uidMemberCard: cardSelected.uidMemberCard,
      cardNo: cardSelected.cardNo
    };
    // console.log('params-->', params);
    // this.toastSvc.loading('正在查询...', 0);
    this.checkoutSvc.memberQuery(params).subscribe(res => {
      // this.toastSvc.hide();
      // console.log('memberQuery-->', res);
      if (res.status.status === 0) {
        if (res.data) {
          const info = res.data;
          memberDetail.memberPoints = info.memberPoints;
          const cards = info.memberReCardDTOs;
          if (cards && cards.length > 0) {
            for (const card of cards) {
              if (cardSelected.cardNo === card.cardNo) {
                cardSelected.uidCardLevel = card.uidCardLevel;
                cardSelected.cardLevelType = card.cardLevelType;
                cardSelected.cardLevelName = card.cardLevelName;
                cardSelected.totalCash = card.totalCash;
                cardSelected.remainMoneyCash = card.remainMoneyCash;
                cardSelected.remainMoneyCift = card.remainMoneyCift;
                return;
              }
            }
          }
        }
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  resetPassword() {
    if (this.loading.password) {
      return false;
    }
    this.loading.password = true;
    const params = {
      authFuctionCode: 'operRePws',
      authFuctionType: '2',
      uidAuthFuction: this.memberDetail.uid
    };
    this.checkAuth.auth(params, null, () => {
      this.presentResetModal().then(() => {
        this.loading.password = false;
      });
    });
  }

  // 重置密码
  async presentResetModal() {
    const detail = this.memberDetail;
    if (detail === undefined || detail.memberMobile === undefined) {
      return;
    }
    const params = {
      memberUid: detail.uid
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ResetPasswordComponent,
      componentProps: {params}
    });
    await modal.present();
    await modal.onDidDismiss();
  }
}
