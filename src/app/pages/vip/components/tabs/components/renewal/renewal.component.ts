import { Component, NgZone, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../../../@theme/modules/toast';
import { PasswordService } from '../../../../../../@theme/modules/password';
import { VoucherPrinter } from '../../../../../../@core/utils/voucher-printer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VipService } from '../../../../vip.service';
import { ActivityDetailComponent } from '../../../../../../@theme/entryComponents/activityDetail/activityDetail.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-vip-tabs-renewal',
  templateUrl: './renewal.component.html',
  styleUrls: ['./renewal.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsRenewalComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  // 静态充值项目
  staticRechargeOption = [50, 100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000];
  rechargeOption;
  renewCondition;
  memberDetail;
  card;
  activities;
  activity;
  isMore = false;
  isHideOption = true;  // 隐藏充值选项
  disableInput = true;  // 禁止金额输入框
  customRechargeAmount;
  rechargeParams;
  subscribe;

  constructor(private zone: NgZone,
              private datePipe: DatePipe,
              private router: Router,
              private modalController: ModalController,
              private message: NzMessageService,
              private passwordSvc: PasswordService,
              private toastSvc: ToastService,
              private vipService: VipService,
              private voucherPrinter: VoucherPrinter
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('续期tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
        this.activities = [];
        this.rechargeOption = [];
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    this.card = memberDetail.cardSeleted;
    console.log('当前卡：', this.card.cardNo);
    this.renewCondition = null;
    this.activities = [];
    this.rechargeOption = [];
    if (this.card.overdue === 1) {
      this.queryCardRenewal();
    }
  }

  // 查询会员卡延期信息
  queryCardRenewal() {
    const params = {
      uidMemberCard: this.card.uidMemberCard
    };
    console.log('参数', params);
    this.toastSvc.loading('正在处理,请稍后...', 0);
    this.vipService.queryCardRenewal(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        const renewCondition = res.data;
        if (renewCondition) {
          this.renewCondition = renewCondition;
          if (renewCondition.renewalRequireValue === '1') {
            this.calRechargeData();
          }
        }
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 根据充值上下限计算数据
  calRechargeData() {
    const card = this.memberDetail.cardSeleted;
    const renewalFeeValue = this.renewCondition.renewalFeeValue; // 单次充值下限
    const downLimited = renewalFeeValue;
    const upLimited = 0; // 单次充值上限
    card.downLimited = renewalFeeValue;
    card.upLimited = upLimited;
    this.card = card;

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
        if (downLimited === 0 && upLimited === 0) {
          // 不限制
          staticList.push(v);
        } else if (downLimited > 0 && upLimited === 0) {
          // 不限制
          if (amount >= downLimited) {
            staticList.push(v);
          }
        } else if (downLimited > 0 && upLimited > 0) {
          // 不限制
          if (amount >= downLimited && amount <= upLimited) {
            staticList.push(v);
          }
        } else if (downLimited === 0 && upLimited > 0) {
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

  // 显示详情界面
  async presentModal(e, activity) {
    // e.stopPropagation();
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ActivityDetailComponent,
      componentProps: {activity},
      cssClass: ''
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }

  // 更多活动1
  more() {
    this.isMore = !this.isMore;
  }

  // 选择活动
  selectActivity(item) {
    this.isHideOption = true;
    this.disableInput = true;
    this.activity = item;
    this.customRechargeAmount = null;
    this.calRechargeParams();
  }

  // 自定义充值金额
  noSelectActivity() {
    this.disableInput = !this.disableInput;
    if (this.disableInput) {
      this.memberDetailChange(this.memberDetail);
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
    this.customRechargeAmount = e;
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

  // 会员卡员卡续期, 需输入会员密码
  // renewalRequireValue = 1:充值,2:抵扣积分,3:缴交费用时调用
  cardRenewal() {
    if (this.card.overdue !== 1) {
      this.message.warning('该卡还没到期,不需续期');
      return;
    }
    const renewCondition = this.renewCondition;
    if (renewCondition === null) {
      return;
    }
    const params: any = {};
    params.uidMember = this.memberDetail.uid;
    params.uidMemberCard = this.card.uidMemberCard;
    params.cardNo = this.card.cardNo;
    params.renewalRequireValue = renewCondition.renewalRequireValue;
    params.renewalFeeValue = renewCondition.renewalFeeValue;
    params.renewalTime = renewCondition.renewalTime;
    if (params.renewalRequireValue === '1') {
      if (this.activity) {
        if (this.activity.uid.indexOf('no') === -1) {
          params.uidCampaign = this.activity.uid;
          params.campaignName = this.activity.campaignName;
        }
        params.rechargeAmount = this.activity.originalAmount;
      } else {
        const rechargeAmount = this.customRechargeAmount;
        if (rechargeAmount) {
          const downLimited = this.card.downLimited;
          const upLimited = this.card.upLimited;
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
        params.rechargeAmount = rechargeAmount;
      }
    }
    this.passwordSvc.show().subscribe(passWord => {
      if (!passWord) {
        return false;
      }
      console.log('会员卡直接缴费续期参数', params);
      params.memberPassword = passWord;
      this.toastSvc.loading('正在处理,请稍后...', 0);
      this.vipService.memberCardRenewal(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          if (params.renewalRequireValue === '2') {
            console.log('扣将积分，成功后关闭');
            this.message.success('续期成功');
            // this.printMemberBussinessTicket(res.data);
            const notifier: any = {};
            notifier.method = 'refreshMemberInfo';
            this.refreshTabEvent.next(notifier);
          } else if (params.renewalRequireValue === '1' || params.renewalRequireValue === '3') {
            console.log('充值,缴交费用,跳转到购支付界面，结算');
            if (res.data) {
              console.log('跳转到购支付界面，结算', res.data);
              const uidShopCart = res.data.uid;
              this.zone.run(() => {
                this.router.navigate(['/checkout/index'], {queryParams: {uidShopCart, businessType: 'MEMBER'}}).then();
              });
            } else {
              this.message.error(res.status.msg2Client);
            }
          }
        } else {
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  printMemberBussinessTicket(billRes) {
    console.log('打印会员业务小票');
    const tasks = [];
    const paramData: any = {};
    paramData.uidBill = billRes.uidPosBill;
    paramData.uidComp = billRes.uidComp;
    paramData.dicCode = 'printPcCert';
    paramData.typeCode = 'T00201'; // 开卡凭证
    tasks.push(paramData);
    if (tasks.length > 0) {
      this.voucherPrinter.printTask(tasks, (printResult) => {
        console.log('打印结果:', printResult);
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

  cancel() {
    console.log('取消');
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
