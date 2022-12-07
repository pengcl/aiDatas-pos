import {Component, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../@theme/modules/toast';
import {AppService} from '../../../../app.service';
import {CheckoutService} from '../../checkout.service';

@Component({
  selector: 'app-checkout-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './cash.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class CheckoutCashComponent implements AfterViewInit {
  modalParams;
  priceWillIncome;  // 应收金额
  payType = '';
  payAmount = '';   // 支付金额
  payAuthCode = ''; // 支付付款码
  bankCardCode = '';  // 银行卡
  payVoucherCode = ''; // 支付凭证
  autofocusType = 'payAmount';
  value;
  @ViewChild('payAmountInput', {static: false}) private payAmountInput: ElementRef;
  @ViewChild('payAuthCodeInput', {static: false}) private payAuthCodeInput: ElementRef;
  @ViewChild('bankCardCodeInput', {static: false}) private bankCardCodeInput: ElementRef;
  loading = false;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private appSvc: AppService,
              private checkoutSvc: CheckoutService
  ) {
    const modalParams = this.navParams.data.params;
    this.modalParams = modalParams;
    this.payType = modalParams.modeCode;
    this.priceWillIncome = modalParams.priceWillIncome;
    this.payAmount = modalParams.priceWillIncome;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log('初始化');
      const payModeCode = this.payType;
      if (payModeCode === 'AliPay' || payModeCode === 'WeixinPay' || payModeCode === 'KuaiqianPay'
        || payModeCode === 'wx_ali_pay' || payModeCode === 'FuiouPay') {
        this.setFocus('payAuthCode');
        this.payAuthCodeInput.nativeElement.focus();
      } else if (payModeCode === 'UnionPay') {
        this.setFocus('bankCardCode');
        this.bankCardCodeInput.nativeElement.focus();
      } else {
        this.setFocus('payAmount');
        this.payAmountInput.nativeElement.focus();
      }
    }, 800);
  }

  // 输入框定位
  setFocus(type) {
    this.autofocusType = type;
    this.value = this[type];
    console.log('type', type + '值' + this.value);
  }

  valueChange(e) {
    console.log(e);
    this[this.autofocusType] = e;
  }

  payAmountChange(e) {
    console.log('modelChange' + e);
    this.value = e;
  }

  payAuthCodeChange(authCode) {
    const payModeCode = this.modalParams.modeCode;
    if (payModeCode === 'AliPay' || payModeCode === 'WeixinPay' || payModeCode === 'KuaiqianPay'
      || payModeCode === 'wx_ali_pay' || payModeCode === 'FuiouPay') {
      if (authCode && (authCode.substr(0, 2) === '62' || authCode.length === 18)) {
        this.confirm();
      }
    }
  }

  // 确认下单
  confirm() {
    if(this.loading){
      return false;
    }
    this.loading = true;
    if (!this.appSvc.isMixPay && this.priceWillIncome > this.payAmount) {
      this.message.warning('不允许混合支付，请一次支付完成！', {nzDuration: 3000});
      return false;
    }
    let returnAmount = 0;
    const payAmount = this.payAmount;
    if (payAmount === '') {
      this.message.warning('支付金额不能为空');
      return;
    } else {
      if (isNaN(Number(payAmount))) {
        this.message.warning('支付金额需大于等于0');
        return;
      } else {
        const payMoney = Number(payAmount);
        if (payMoney > this.priceWillIncome) {
          if (this.modalParams.modeCode === 'Cash') {
            returnAmount = payMoney - this.priceWillIncome;
          } else {
            this.message.warning('支付金额不能大于订单金额');
            return;
          }
        }
      }
    }
    // 支付信息，必须传
    const payModeCode = this.modalParams.modeCode;
    const payment: any = {};
    payment.payModeCode = payModeCode;
    payment.payAmount = Number(this.payAmount); // 支付金额
    if (payModeCode === 'Cash') {
      payment.returnAmount = returnAmount; // 现金支付找零金额
    } else if (payModeCode === 'UnionPay') {
      payment.paymentAccount = this.bankCardCode;
      payment.paymentVoucherNo = this.payVoucherCode;
    } else if (payModeCode === 'AliPay' || payModeCode === 'WeixinPay' || payModeCode === 'KuaiqianPay'
      || payModeCode === 'wx_ali_pay' || payModeCode === 'FuiouPay') {
      if (!this.payAuthCode) {
        this.message.warning('付款码不能为空');
        return;
      }
      // 微信付款码规则：18位纯数字，以10、11、12、13、14、15开头
      const weixin_regex = new RegExp('^(10|11|12|13|14|15)\\d{16}$');
      // 支付宝付款码规则：付款码将由原来的28开头扩充到25-30开头，长度由原来的16-18位扩充到16-24位
      const alipay_regex = new RegExp('^(25|26|27|28|29|30)\\d{14,22}$');
      if (payModeCode === 'WeixinPay') {
        if (weixin_regex.test(this.payAuthCode) === false) {
          this.message.warning('微信付款码错误，请检查');
          return;
        }
      } else if (payModeCode === 'AliPay') {
        if (alipay_regex.test(this.payAuthCode) === false) {
          this.message.warning('支付宝付款码错误，请检查');
          return;
        }
      } else if (payModeCode === 'wx_ali_pay') {
        if (alipay_regex.test(this.payAuthCode) === false && weixin_regex.test(this.payAuthCode) === false) {
          this.message.warning('微信或支付宝付款码错误，请检查');
          return;
        }
      }
      payment.payAuthCode = this.payAuthCode;
    } else if (payModeCode === 'NormalRecharge' || payModeCode === 'NormalCinemaPay' || payModeCode === 'NormalSPay') {
      if (!this.payAuthCode) {
        this.message.warning('付款码不能为空');
        return;
      }
      payment.payAuthCode = this.payAuthCode;
    }
    const saveBillParams: any = {};
    saveBillParams.uidShopCart = this.modalParams.uidShopCart;
    saveBillParams.billSaleType = this.modalParams.businessType;
    saveBillParams.takeGoodsType = this.modalParams.takeGoodsType;
    saveBillParams.memberInfo = {};
    saveBillParams.payment = payment;
    saveBillParams.paymentList = [payment];
    saveBillParams.notErrorInterceptor = true;
    console.log('saveBillParams-->', saveBillParams);
    this.toastSvc.loading('正在处理...', 0);
    this.loading = true;
    this.checkoutSvc.saveBill(saveBillParams).subscribe(res => {
      this.loading = false;
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
        console.log('支付失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 取消关闭
  dismiss() {
    this.modalController.dismiss().then();
  }
}
