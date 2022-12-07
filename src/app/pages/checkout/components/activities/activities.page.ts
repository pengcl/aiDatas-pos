import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {ToastService} from '../../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CheckoutService} from '../../checkout.service';
import {SubService} from '../../../sub/sub.service';

@Component({
  selector: 'app-checkout-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
  providers: [NzMessageService]
})
export class CheckoutActivitiesPage implements OnInit, OnDestroy {
  @Output() refreshShoppingCardEvent: EventEmitter<any> = new EventEmitter();

  // 活动结果
  detail;
  payDetails;
  activities;
  shoppingCartInfoSubscribe;
  actPriceService = 0;
  actPriceSupply = 0;

  constructor(
    private toastSvc: ToastService,
    private message: NzMessageService,
    private subSvc: SubService,
    private checkoutSvc: CheckoutService
  ) {
  }

  ngOnInit() {
    this.shoppingCartInfoSubscribe = this.checkoutSvc.getShoppingCartDetail().subscribe(res => {
      if (res) {
        // console.log('notifier-->', res.notifier);
        this.detail = res.detail;
        console.log(res.memberStatus);
        if (res.notifier && res.notifier.indexOf('acts') !== -1) {
          // console.log('acts-刷新购物车数据,刷新活动');
          // console.log("acts-刷新购物车数据", res.detail);
          if (res.memberStatus === 'logout') {
            // this.detail = res.detail;
            this.cancelActivities().then();
          } else {
            // this.detail = res.detail;
            if (res.memberStatus === 'login') {
              this.cancelActivities().then();
            }
            this.setPayment();
            this.queryActivities();
          }
        } else if (res.notifier && res.notifier.indexOf('act_payment') !== -1) {
          // console.log('act_payment-刷新购物车数据,刷新支付');
          // console.log("acts-刷新购物车数据", res.shopCardDetail);
          // this.detail = res.detail;
          this.setPayment();
        }
      } else {
        this.activities = null;
        this.subSvc.updateSub('activities', this.activities);
      }
    });

  }

  queryActivities() {
    if (this.detail) {
      const params = this.getActParam(this.detail);
      this.checkoutSvc.queryActivities(params).subscribe(res => {
        if (res.data && res.data.joinList && res.data.joinList.length > 0) {
          const activities = res.data.joinList;
          activities.forEach(item => {
            if (!item.selected) {
              item.selected = false;
            }
          });
          this.activities = activities;
          /*const activity = activities[0];
          if ((activity.campaignType === 2 || activity.campaignType === 3) && activity.totalPriceDifference >= 0) {
            this.promotionCampaign(activity);
          }*/
          // console.log('活动结果', this.activities);
        } else {
          // console.log('没有活动');
          this.activities = null;
        }
        this.subSvc.updateSub('activities', this.activities);
      });
    }
    // todo
  }

  // 过滤查询活动不需传的值
  getActParam(detail) {
    const parmas: any = {};
    parmas.uidChannel = detail.uidChannel;
    parmas.uidComp = detail.uidComp;
    parmas.cinemaCode = detail.cinemaCode;
    parmas.cinemaName = detail.cinemaName;
    parmas.terminalCode = detail.terminalCode;
    parmas.uidShopCart = detail.uidShopCart;
    parmas.shopCartCode = detail.shopCartCode;
    parmas.uidMovie = detail.uidMovie;
    parmas.uidPosResourcePlan = detail.uidPosResourcePlan;
    parmas.billSaleType = detail.billSaleType;
    parmas.cartHallCode = detail.cartHallCode;
    parmas.cartHallName = detail.cartHallName;
    parmas.cartHallType = detail.cartHallType;
    parmas.cartMovieCode = detail.cartMovieCode;
    parmas.cartMovieName = detail.cartMovieName;
    parmas.cartMovieDuration = detail.cartMovieDuration;
    parmas.cartMovieLanguage = detail.cartMovieLanguage;
    parmas.showTimeEnd = detail.showTimeEnd;
    parmas.showTimeStart = detail.showTimeStart;
    parmas.cartMoviePublish = detail.cartMoviePublish;
    parmas.cartPlanCode = detail.cartPlanCode;
    parmas.cartValidTime = detail.cartValidTime;
    parmas.posShopCartPlanSeatDTOList = detail.posShopCartPlanSeatDTOList;
    parmas.posShopCartResDTOList = detail.posShopCartResDTOList;
    if (detail.uidMemberCard) {
      parmas.uidMember = detail.uidMember;
      parmas.uidMemberCard = detail.uidMemberCard;
      parmas.uidMemberCardLevel = detail.uidMemberCardLevel;
      parmas.memberCardLevelName = detail.memberCardLevelName;
      parmas.memberCardNo = detail.memberCardNo;
    }
    return parmas;
  }

  async cancelActivities() {
    // console.log('登出会员，取消已选活动，再刷新购物车');
    if (this.detail) {
      const activities = this.activities;
      if (activities && activities.length > 0) {
        for (const item of activities) {
          if (item.selected) {
            const restRs = await this.cancelActs(item);
            // console.log(restRs);
          }
        }
      }
      const notifier = 'cancelActivities(cart,acts,check)';
      this.refreshShoppingCardEvent.emit(notifier);
    }
  }

  getReducePoints(activity) {
    let reducePoints = 0;
    let count = 0;
    const seats = this.detail.posShopCartPlanSeatDTOList;
    if (activity.ruleData &&
      JSON.parse(activity.ruleData).priceStrategy &&
      JSON.parse(activity.ruleData).priceStrategy.extendJson &&
      seats) {
      const extendJson = JSON.parse(activity.ruleData).priceStrategy.extendJson;
      reducePoints = parseInt(JSON.parse(extendJson).redunctPoints, 10);
      this.detail.posShopCartPlanSeatDTOList.forEach(item => {
        if (item.uidCampaign === activity.uid) {
          count++;
        }
      });
    }
    return reducePoints * count;
  }

  cancelActs(activity) {
    return new Promise((resolve, error) => {
      const params: any = {};
      params.uidShopCart = this.detail.uidShopCart;
      params.campaignUid = activity.uid;
      params.campaignName = activity.campaignName;
      params.operation = '0';
      // console.log('取消活动->', activitie.campaignName);
      params.redunctPoints = this.getReducePoints(activity);
      this.checkoutSvc.promotionCampagin(params).subscribe(res => {
        return resolve(res);
      });
    });
  }

  // 变更活动选择
  promotionCampaign(activity) {
    // console.log('接收选择或取消活动事件，调用活动变更接口', activity);
    const selected = activity.selected; // 活动选中状态
    if (this.hasPay()) {
      this.message.warning('如需选择或取消活动，请先删除已支付记录');
      return;
    }
    const params: any = {};
    params.uidShopCart = this.detail.uidShopCart;
    params.campaignUid = activity.uid;
    params.campaignName = activity.campaignName;
    params.operation = (selected ? '0' : '1');
    params.redunctPoints = this.getReducePoints(activity);
    this.toastSvc.loading('正在处理,请稍后...', 0);
    this.checkoutSvc.promotionCampagin(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {// 成功
        if (this.activities) {
          for (const item of this.activities) {
            if (activity.uid === item.uid) {
              item.selected = !selected;
              break;
            }
          }
        }
        this.subSvc.updateSub('activities', this.activities);
        const notifier = 'promotion(cart,check)';
        this.refreshShoppingCardEvent.emit(notifier);
      } else {
        // console.log('参与活动失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 已支付记录
  setPayment() {
    // console.log('act_执行刷新支付记录');
    let payDetails = [];
    const shopCartTicketDTOList = this.detail.shopCartTicketDTOList;
    if (shopCartTicketDTOList && shopCartTicketDTOList.length > 0) {
      shopCartTicketDTOList.forEach(item => {
        const pay: any = {};
        pay.payModeCode = 'coupon';
        pay.payModeName = item.ticketName;
        pay.billPayAmount = item.ticketAmount;
        pay.ticketCode = item.ticketCode;
        pay.ticketName = item.ticketName;
        pay.ticketMode = item.ticketMode;
        payDetails.push(pay);
      });
    }
    const prePayList = this.detail.prePayList;
    if (prePayList && prePayList.length > 0) {
      payDetails = payDetails.concat(prePayList);
    }
    this.payDetails = payDetails;
  }

  // 是否有支付
  hasPay() {
    let flag = false;
    const payDetails = this.payDetails;
    if (payDetails && payDetails.length > 0) {
      flag = true;
    }
    return flag;
  }

  setActivity(activity, e) {
    e.stopPropagation();
    e.preventDefault();
    activity.detailShow = !activity.detailShow;
  }

  ngOnDestroy() {
    if (this.shoppingCartInfoSubscribe) {
      this.detail = null;
      this.shoppingCartInfoSubscribe.unsubscribe();
    }
  }
}
