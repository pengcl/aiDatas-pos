import {Component, ViewChild, AfterViewInit, ElementRef, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ToastService} from '../../../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NavParams, ModalController} from '@ionic/angular';
import {VipService} from '../../../../vip/vip.service';
import {CheckoutService} from '../../../checkout.service';
import {VoucherPrinter} from '../../../../../@core/utils/voucher-printer';
import {ActivityDetailComponent} from '../../../../../@theme/entryComponents/activityDetail/activityDetail.component';

@Component({
  selector: 'app-checkout-memberCard-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['../../../../../../theme/ion-modal.scss', './recharge.component.scss'],
  providers: [DatePipe, NzMessageService, NzModalService]
})
export class CheckoutMemberCardRechargeComponent {
  memberDetail;
  cardSelected;  // 选择的卡号
  activities;
  activity;
  isMore = false;
  isHideOption = true;  // 隐藏充值选项
  disableInput = true;  // 禁止金额输入框
  rechargeParams;
  rechargePayTypeList;
  payType;
  payAuthCode;
  payVoucherCode;
  bankCardCode;
  customRechargeAmount;
  // 静态充值项目
  staticRechargeOption = [50, 100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000];
  rechargeOption;
  autofocusType = '';
  @ViewChild('payAuthCodeInput') private payAuthCodeInput: ElementRef;
  @ViewChild('bankCardCodeInput') private bankCardCodeInput: ElementRef;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private nzmodal: NzModalService,
    private message: NzMessageService,
    private toastSvc: ToastService,
    private vipService: VipService,
    private checkoutSvc: CheckoutService,
    private voucherPrinter: VoucherPrinter
  ) {
    const modalParams = this.navParams.data.params;
    this.rechargePayTypeList = modalParams.rechargePayTypeList;
    const memberDetail = modalParams.memberDetail;
    this.isHideOption = true;
    this.customRechargeAmount = null;
    this.rechargeCampaignQuery(memberDetail);
  }

  // 显示详情界面
  async presentModal(e, activity) {
    // e.stopPropagation();
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ActivityDetailComponent,
      componentProps: {activity},
      cssClass: 'activity-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }

  rechargeCampaignQuery(memberDetail) {
    const card = memberDetail.cardSelected;
    const params: any = {};
    params.uidMember = memberDetail.uid;
    params.uidMemberCard = card.uidMemberCard;
    params.memberCardLevel = card.uidCardLevel;
    params.bussnessType = '0'; // 普通充值
    this.toastSvc.loading('正在查询活动', 0);
    this.vipService.rechargeCampaignQuery(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        console.log('获取活动失败成功', res.data);
        if (res.data) {
          memberDetail.cardSelected.campaignShowDTOList = res.data;
        }
      } else {
        console.log('获取活动失败');
        this.message.error(res.status.msg2Client);
      }
      this.memberDetail = memberDetail;
      this.calRechargeData(this.memberDetail);
    });
  }

  calRechargeData(memberDetail) {
    const card = memberDetail.cardSelected;
    let downLimited = 0; // 单次充值下限
    let upLimited = 0; // 单次充值上限
    const cardParamEntityList = memberDetail.cardParamEntityList;
    if (cardParamEntityList && cardParamEntityList.length > 0) {
      for (const cardParam of cardParamEntityList) {
        if (cardParam.conditionCode === 'topUpThreshold') {
          card.topUpThreshold = cardParam.conditionValue;
        }
        if (cardParam.conditionCode === 'topUpCeiling') {
          card.topUpCeiling = cardParam.conditionValue;
        }
      }
    }
    if (card.topUpThreshold) {
      downLimited = card.topUpThreshold;
    }
    if (card.topUpCeiling) {
      upLimited = card.topUpCeiling;
    }
    card.downLimited = downLimited;
    card.upLimited = upLimited;

    // 计算充值金额限制名
    let rechargeLimitText = '';
    console.log('计算充值限制，downLimited:', downLimited, 'upLimited:', upLimited);
    if (downLimited === 0 && upLimited === 0) {
      rechargeLimitText = '单次充值限额范围：不限';
    } else if (downLimited > 0 && upLimited === 0) {
      rechargeLimitText = '最低充值金额：' + downLimited;
    } else if (downLimited > 0 && upLimited > 0) {
      rechargeLimitText = '单次充值限额范围 ¥ ' + downLimited + '-' + upLimited;
    } else if (downLimited === 0 && upLimited > 0) {
      rechargeLimitText = '最高充值金额：' + upLimited;
    }
    card.rechargeLimitText = rechargeLimitText;
    this.cardSelected = card;

    // 计算可参与的活动
    const rechargeActivities = [];
    const oriCampaignList = card.campaignShowDTOList;
    if (oriCampaignList && oriCampaignList.length > 0) {
      oriCampaignList.map((v, i) => {
        if (downLimited === 0 && upLimited === 0) {
          // 不限制
          rechargeActivities.push(v);
        } else if (downLimited > 0 && upLimited === 0) {
          // 充值下限制
          if (v.originalAmount >= downLimited) {
            rechargeActivities.push(v);
          }
        } else if (downLimited > 0 && upLimited > 0) {
          // 充值上，下限制
          if (v.originalAmount >= downLimited && v.originalAmount <= upLimited) {
            rechargeActivities.push(v);
          }
        } else if (downLimited === 0 && upLimited > 0) {
          // 充值上限制
          if (v.originalAmount <= upLimited) {
            rechargeActivities.push(v);
          }
        }
      });
    }
    const newCampList = [];
    for (const camp of rechargeActivities) {
      newCampList.push(camp.originalAmount);
    }
    const staticRechargeOption = this.staticRechargeOption;
    const staticList = [];
    if (staticRechargeOption && staticRechargeOption.length > 0) {
      for (const amount of staticRechargeOption) {
        if (newCampList && newCampList.length > 0) {
          if (newCampList.indexOf(amount) > -1) {
            // console.log('过滤相同的amount', amount);
            continue;
          }
        }
        const v: any = {};
        v.uid = 'no_' + amount;
        v.originalAmount = amount;
        v.isChecked = false;
        if (downLimited == 0 && upLimited == 0) {
          // 不限制
          staticList.push(v);
        } else if (downLimited > 0 && upLimited == 0) {
          // 不限制
          if (amount >= downLimited) {
            staticList.push(v);
          }
        } else if (downLimited > 0 && upLimited > 0) {
          // 不限制
          if (amount >= downLimited && amount <= upLimited) {
            staticList.push(v);
          }
        } else if (downLimited == 0 && upLimited > 0) {
          if (amount <= upLimited) {
            staticList.push(v);
          }
        }
      }
    }
    let rechargeOption: any = [];
    rechargeOption = rechargeActivities.concat(staticList);
    if (rechargeOption && rechargeOption.length > 0) {
      rechargeOption.sort((a, b) => {
        if (a.originalAmount > b.originalAmount) {
          return 1; // 升序
        } else if (a.originalAmount < b.originalAmount) {
          return -1;
        }
      });
      rechargeOption.map((v, i) => {
        if (i === 0) {
          v.isChecked = true;
        }
      });
    }
    // console.log('rechargeOption-->', rechargeOption);
    card.rechargeActivities = rechargeOption;
    this.activities = card.rechargeActivities;
    if (this.activities && this.activities.length > 0) {
      this.activity = this.activities[0];
      this.calRechargeParams();
    }
    this.rechargeOption = rechargeOption;

  }

  // 更多活动
  more() {
    this.isMore = !this.isMore;
  }

  // 选择活动
  selectActivity(item) {
    this.isHideOption = true;
    this.disableInput = true;
    this.activity = item;
    this.calRechargeParams();
  }

  // 选择支付
  selectPay(item) {
    this.payAuthCode = '';
    this.bankCardCode = '';
    this.payVoucherCode = '';
    const payModeCode = item.modeCode;
    this.payType = payModeCode;
    this.autofocusType = this.payType;
    setTimeout(() => {
      if (payModeCode === 'AliPay' || payModeCode === 'WeixinPay' || payModeCode === 'KuaiqianPay'
        || payModeCode === 'wx_ali_pay' || payModeCode === 'FuiouPay') {
        this.setFocus('payAuthCode');
        this.payAuthCodeInput.nativeElement.focus();
      } else if (payModeCode === 'UnionPay') {
        this.setFocus('bankCardCode');
        this.bankCardCodeInput.nativeElement.focus();
      }
    }, 500);
  }

  setFocus(e) {
    console.log(e);
    this.autofocusType = e;
  }

  payAuthCodeChange(authCode) {
    const payModeCode = this.payType;
    if (payModeCode === 'AliPay' || payModeCode === 'WeixinPay' || payModeCode === 'KuaiqianPay'
      || payModeCode === 'wx_ali_pay' || payModeCode === 'FuiouPay') {
      if (authCode && (authCode.substr(0, 2) === '62' || authCode.length === 18)) {
        this.memberCardRecharge();
      }
    }
  }

  // 自定义充值金额
  noSelectActivity() {
    this.disableInput = !this.disableInput;
    if (this.disableInput) {
      this.calRechargeData(this.memberDetail);
    } else {
      this.isHideOption = false;
      this.disableInput = false;
      this.activity = null;
      this.customRechargeAmount = null;
      this.calRechargeParams();
    }
  }

  // 设置充值金额
  setCustomRechargeAmount(item) {
    console.log('item', item);
    this.activity = null;
    this.customRechargeAmount = item.amount;
    this.calRechargeParams();
  }

  customRechargeAmountChange(e) {
    console.log('customRechargeAmountChange', e);
    this.calRechargeParams();
  }

  calRechargeParams() {
    const rechargeParams: any = {};
    if (this.activity) {
      this.customRechargeAmount = this.activity.originalAmount;
      rechargeParams.rechargeAmount = this.activity.originalAmount;
      if (this.activity.uid.indexOf('no') === -1) {
        rechargeParams.campaignName = this.activity.campaignName;
      } else {
        rechargeParams.campaignName = '无';
      }
    } else {
      const rechargeAmount = this.customRechargeAmount;
      rechargeParams.rechargeAmount = rechargeAmount ? rechargeAmount : 0;
      rechargeParams.campaignName = '无';
    }
    this.rechargeParams = rechargeParams;
  }

  // 查询会员卡充值活动
  memberCardRecharge() {
    let rechargeAmount = 0;
    let uidCampaign = '';
    let campaignName = '';
    if (this.activity) {
      if (this.activity.uid.indexOf('no') === -1){
        uidCampaign = this.activity.uid;
        campaignName = this.activity.campaignName;
      }
      rechargeAmount = this.activity.originalAmount;
    } else {
      rechargeAmount = this.customRechargeAmount;
      if (rechargeAmount) {
        const downLimited = this.cardSelected.downLimited;
        const upLimited = this.cardSelected.upLimited;
        if (rechargeAmount < downLimited) {
          this.message.warning('充值金额不能小于' + downLimited);
          return;
        } else if (upLimited > 0 && rechargeAmount > upLimited) {
          this.message.warning('充值金额不能大于' + upLimited);
          return;
        } else if (rechargeAmount <= 0) {
          this.message.warning('请输入大于0的充值金额');
          return;
        }
      } else {
        this.message.warning('请选择充值金额');
        return;
      }
    }
    const payModeCode = this.payType;
    if (!payModeCode) {
      this.message.warning('请选择支付方式');
      return;
    }
    const payment: any = {};
    payment.payModeCode = payModeCode;
    payment.payAmount = rechargeAmount; // 支付金额
    if (this.payType === 'Cash') {
      payment.returnAmount = 0; // 现金支付找零金额
    } else if (payModeCode === 'UnionPay') {
      payment.paymentAccount = this.bankCardCode;
      payment.paymentVoucherNo = this.payVoucherCode;
    } else if (payModeCode === 'AliPay' || payModeCode === 'WeixinPay' || payModeCode === 'KuaiqianPay'
      || payModeCode === 'wx_ali_pay' || payModeCode === 'FuiouPay') {
      const payAuthCode = this.payAuthCode;
      if (!payAuthCode) {
        this.message.warning('付款码不能为空');
        return;
      }
      // 微信付款码规则：18位纯数字，以10、11、12、13、14、15开头
      const weixin_regex = new RegExp('^(10|11|12|13|14|15)\\d{16}$');
      // 支付宝付款码规则：付款码将由原来的28开头扩充到25-30开头，长度由原来的16-18位扩充到16-24位
      const alipay_regex = new RegExp('^(25|26|27|28|29|30)\\d{14,22}$');
      if (payModeCode === 'WeixinPay') {
        if (weixin_regex.test(payAuthCode) === false) {
          this.message.warning('微信付款码错误，请检查');
          return;
        }
      } else if (payModeCode === 'AliPay') {
        if (alipay_regex.test(payAuthCode) === false) {
          this.message.warning('支付宝付款码错误，请检查');
          return;
        }
      } else if (payModeCode === 'wx_ali_pay') {
        if (alipay_regex.test(payAuthCode) === false && weixin_regex.test(payAuthCode) === false) {
          this.message.warning('微信或支付宝付款码错误，请检查');
          return;
        }
      }
      payment.payAuthCode = payAuthCode;
    } else if (payModeCode === 'NormalRecharge' || payModeCode === 'NormalCinemaPay' || payModeCode === 'NormalSPay') {
      if (!this.payAuthCode) {
        this.message.warning('付款码不能为空');
        return;
      }
      payment.payAuthCode = this.payAuthCode;
    }
    const params = {
      businessType: 'memCardRecharge',
      cardNo: this.cardSelected.cardNo,
      uidCardLevel: this.cardSelected.uidCardLevel,
      uidMemberCard: this.cardSelected.uidMemberCard,
      cardLevelType: this.cardSelected.cardLevelType,
      uidCampaign,
      campaignName,
      rechargeAmount,
      memberRechargeType: '0',
      payment
    };
    this.callRecharge(params);
  }

  callRecharge(params) {
    console.log('充值参数', params);
    this.toastSvc.loading('正在处理...', 0);
    this.checkoutSvc.saveMemberRechargeBill(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data) {
        console.log('成功', res.data);
        const payResult = res.data;
        this.printMemberBussinessTicket(payResult);
        this.message.success('充值成功');
        this.modalController.dismiss(payResult).then();
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  printMemberBussinessTicket(billRes) {
    console.log('打印会员业务小票');
    const tasks = [];
    const paramData: any = {};
    paramData.uidBill = billRes.uidPosBill;
    paramData.uidComp = billRes.uidComp;
    paramData.typeCode = 'T00202'; // 充值
    paramData.dicCode = 'printCharCert';
    tasks.push(paramData);
    if (tasks.length > 0) {
      this.voucherPrinter.printTask(tasks, (printResult) => {
        // console.log('打印结果:', printResult);
        if (printResult.status === '0') {
          // 通知后台已经打印过影票
        } else if (printResult.status === '-1') {
          console.log('后台设置不需打印');
        } else {
          const msg = '打印失败：' + printResult.msg;
          console.log(msg);
        }
      });
    }
  }

  dismiss() {
    // 回传参数
    this.modalController.dismiss().then();
  }


}
