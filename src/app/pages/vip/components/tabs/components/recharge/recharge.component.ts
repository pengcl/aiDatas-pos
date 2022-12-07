import {Component, NgZone, OnInit, OnDestroy, Output, EventEmitter, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {VipService} from '../../../../vip.service';
import {ModalController} from '@ionic/angular';
/*import {Validators} from '@angular/forms';
import {getBirthday, getBirthdayFromIdCard} from '../../../../../../@core/utils/extend';
import {PosAuthComponent} from '../../../../../../@theme/entryComponents/posAuth/posAuth';*/
import {ActivityDetailComponent} from '../../../../../../@theme/entryComponents/activityDetail/activityDetail.component';

@Component({
  selector: 'app-vip-tabs-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.scss'],
  providers: [NzMessageService, NzModalService]
})
export class VipTabsRechargeComponent implements OnInit, OnDestroy {
  memberDetail;
  cardSeleted;  // 选择的卡号
  activities;
  activity;
  isMore = false;
  isHideOption = true;  // 隐藏充值选项
  disableInput = true;  // 禁止金额输入框
  customRechargeAmount;
  rechargeParams;
  // 静态充值项目
  staticRechargeOption = [50, 100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000];
  rechargeOption;

  subscribe;
  @Output() leavePage: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();

  /*@ViewChild('customRecharge', {static: false}) private customRecharge;*/

  constructor(private zone: NgZone,
              private route: ActivatedRoute,
              private router: Router,
              private modalController: ModalController,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private nzmodal: NzModalService,
              private vipService: VipService) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      this.activity = null;
      if (res) {
        console.log('充值tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  /*blur(target) {
    console.log(target);
  }

  change(e) {
    console.log(e);
    this.customRechargeAmount = e;
  }*/

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

  memberDetailChange(memberDetail) {
    // 初始化
    this.activities = [];
    this.activity = null;
    this.isHideOption = true;
    this.customRechargeAmount = null;
    this.memberDetail = memberDetail;
    this.calRechargeData(memberDetail.cardSeleted);
    // console.log('当前卡：', this.cardSeleted);
    // console.log('当前卡：', this.cardSeleted.cardNo);
  }

  // 根据充值上下限计算数据
  calRechargeData(card) {
    if (!card) {
      return false;
    }
    let downLimited = 0; // 单次充值下限
    let upLimited = 0; // 单次充值上限
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
    this.cardSeleted = card;
    this.activities = card.rechargeActivities;
    if (this.activities && this.activities.length > 0) {
      this.activity = this.activities[0];
      this.calRechargeParams();
    }
    this.rechargeOption = rechargeOption;

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
    console.log(e);
    if (e <= 0) {
      this.customRechargeAmount = 0;
    } else {
      this.customRechargeAmount = e;
    }
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
    console.log(this.rechargeParams);
  }

  // 查询会员卡充值活动
  memberCardRecharge() {
    const cardSeleted = this.cardSeleted;
    if (cardSeleted.cardLevelType !== 0) {
      this.message.warning('该卡不是储值卡，不能充值');
      return;
    }
    if (cardSeleted.overdue === 1) {
      this.nzmodal.confirm({
        nzTitle: ('该卡有效期：' + cardSeleted.cardValidDateStr + '，已过期'),
        nzContent: '',
        nzOkText: '去续期',
        nzCancelText: '知道了',
        nzOkType: 'primary',
        // nzOkDanger: true,
        nzOnOk: () => {
          const notifier: any = {};
          notifier.toTabIndex = 5;
          this.refreshTabEvent.next(notifier);
        },
        nzOnCancel: () => {
        }
      });
      return;
    }

    let rechargeAmount = 0;
    let uidCampaign = '';
    let campaignName = '';
    if (this.activity) {
      if (this.activity.uid.indexOf('no') === -1) {
        uidCampaign = this.activity.uid;
        campaignName = this.activity.campaignName;
      }
      rechargeAmount = this.activity.originalAmount;
    } else {
      rechargeAmount = this.customRechargeAmount;
      if (rechargeAmount) {
        const downLimited = cardSeleted.downLimited;
        const upLimited = cardSeleted.upLimited;
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
    const params = {
      uidCardLevel: cardSeleted.uidCardLevel,
      uidMemberCard: cardSeleted.uidMemberCard,
      uidCampaign,
      campaignName,
      remainMoneyCash: rechargeAmount
    };
    this.callRecharge(params);
  }

  callRecharge(params) {
    console.log('充值参数', params);
    this.toastSvc.loading('正在处理，请稍后...', 0);
    this.vipService.memberCardRecharge(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data) {
        console.log('成功,跳转到购支付界面，结算', res.data);
        const uidShopCart = res.data.uid;
        this.zone.run(() => {
          this.leavePage.next('checkout');
          console.log(this.route.snapshot.queryParams.shoppingCart);
          this.router.navigate(['/checkout/index'], {
            queryParams: {
              uidShopCart,
              businessType: 'MEMBER',
              vip: !!this.route.snapshot.queryParams.shoppingCart
            }
          }).then();
        });
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
