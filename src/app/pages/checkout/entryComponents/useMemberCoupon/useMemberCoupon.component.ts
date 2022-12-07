import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NavParams, ModalController} from '@ionic/angular';
import {CheckoutService} from '../../checkout.service';
import {ShoppingCartService} from '../../../shopping-cart/shopping-cart.service';
import {ToastService} from '../../../../@theme/modules/toast';
import {PasswordService} from '../../../../@theme/modules/password';
import {getPage, currentPageData} from '../../../../@theme/modules/pagination/pagination.component';

interface DataItem {
  used: number;
  typeName: string;
  ticketCode: string;
  ticketName: string;
  effectDate: string;
  useConditon: string;
  ticketMoney: string;
}


@Component({
  selector: 'app-checkout-useMemberCoupon',
  templateUrl: './useMemberCoupon.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './useMemberCoupon.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class CheckoutUseMemberCouponComponent {
  shopCardDetail;
  memberMobile;
  checked = false;
  couponList: DataItem[] = [];
  indeterminate = false;
  listOfCurrentPageData: ReadonlyArray<any> = [];
  selected = {};
  page: any = {
    currentPage: 1,
    pageSize: 10,
    totalSize: 0
  };
  currentPageData = currentPageData;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private checkoutSvc: CheckoutService,
              private shoppingCartSvc: ShoppingCartService,
              private message: NzMessageService,
              private passwordSvc: PasswordService) {
    const params = this.navParams.data.params;
    this.shopCardDetail = params.shopCardDetail;
    this.memberMobile = params.memberMobile;
    this.queryMemberTicket();
  }

  change(e) {
    console.log(e);

  }


  // 查询会员票券
  queryMemberTicket() {
    const currentPage = 1;
    const params: any = {};
    params.memberMobile = this.memberMobile;
    params.memberPhoneNum = this.memberMobile;
    params.dataType = '1';
    params.ticketStatus = '0';
    params.page = {
      currentPage,
      pageSize: 10
    };
    console.log('参数', params);
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.checkoutSvc.queryMemberTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data) {
          const couponList = res.data.memberTikcetList;
          if (couponList && couponList.length > 0) {
            couponList.forEach(item => {
              item.used = this.shopCardDetail.shopCartTicketDTOList
              .filter(ticket => ticket.ticketCode === item.ticketCode).length > 0 ? 1 : 0;
              item.categoryName = this.getCategoryName(item.category);
              item.typeName = this.getTypeName(item.type);
              item.ticketStatusName = this.getTicketStatusName(item.ticketStatus);
              item.effectDate = this.getEffectDate(item.effectiveDate, item.expirationDate);
            });
          }
          this.couponList = couponList;
          this.page = getPage(this.couponList);
        }
      } else {
        console.log('失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 票券分类
  getCategoryName(category) {
    let name;
    switch (category) {
      case 1:
        name = '电影票券';
        break;
      case 2:
        name = '卖品票券';
        break;
      case 3:
        name = '混合票券';
        break;
      default:
        name = '';
    }
    return name;
  }

  // 票券类型
  getTypeName(type) {
    let name;
    switch (type) {
      case 1:
        name = '兑换券';
        break;
      case 2:
        name = '优惠券';
        break;
      case 3:
        name = '代金券';
        break;
      default:
        name = '';
    }
    return name;
  }

  // 票券状态
  getTicketStatusName(ticketStatus) {
    let name;
    switch (ticketStatus) {
      case 1:
        name = '未激活';
        break;
      case 2:
        name = '已激活';
        break;
      case 3:
        name = '已消费';
        break;
      case 4:
        name = '已退货';
        break;
      case 5:
        name = '已停用';
        break;
      case 6:
        name = '已作废';
        break;
      default:
        name = '';
    }
    return name;
  }

  // 获取有效期
  getEffectDate(effectiveDate, expirationDate) {
    let effectDate = '不限';
    if (effectiveDate && expirationDate) {
      effectDate = effectiveDate + '至' + expirationDate;
    }
    return effectDate;
  }

  addCoupon(targetCoupon) {
    console.log('添加', targetCoupon);
    const shopCardDetail = this.shopCardDetail;
    if (shopCardDetail === undefined || shopCardDetail.uidMember === null || shopCardDetail.uidMember === ''){
      this.message.warning('请登录会员');
      return;
    }
    const params: any = {};
    params.uidShopCart = shopCardDetail.uidShopCart;
    params.ticketCode = targetCoupon.ticketCode;
    params.ticketMode = '1';
    /*this.passwordSvc.show('', true, uid).subscribe(res => {
      if (!res) {
        return false;
      }
    });*/
    this.toastSvc.loading('正在处理，请稍后...', 0);
    this.checkoutSvc.addTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data) {
        const ticketRs = res.data;
        const couponList = this.couponList;
        for (const item of couponList) {
          if (item.ticketCode === targetCoupon.ticketCode) {
            item.used = 1;
            break;
          }
        }
        this.couponList = [...this.couponList];
        this.updateShopcartDetailPrice(ticketRs);
        // console.log('couponList-->', this.couponList);
      } else {
        console.log('失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  delCoupon(coupon) {
    console.log('删除', coupon);
    const params: any = {};
    params.uidShopCart = this.shopCardDetail.uidShopCart;
    params.ticketCode = coupon.ticketCode;
    this.toastSvc.loading('正在处理，请稍后...', 0);
    this.checkoutSvc.delTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data) {
        const ticketRs = res.data;
        const couponList = this.couponList;
        for (const item of couponList) {
          if (item.ticketCode === coupon.ticketCode) {
            item.used = 0;
            break;
          }
        }
        this.couponList = [...this.couponList];
        this.updateShopcartDetailPrice(ticketRs);
      } else {
        console.log('失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 使用票券后更新价格
  updateShopcartDetailPrice(ticketRs) {
    const shopCardDetail = this.shopCardDetail;
    shopCardDetail.priceOriginal = ticketRs.priceOriginal;
    shopCardDetail.priceReduce = ticketRs.priceReduce;
    shopCardDetail.priceShouldIncome = ticketRs.priceShouldIncome;
    shopCardDetail.priceAlreadyIncome = ticketRs.priceAlreadyIncome;
    shopCardDetail.priceWillIncome = ticketRs.priceWillIncome;
    this.shopCardDetail = shopCardDetail;
  }

  // 确定下单
  confirm() {
    if (this.getSelectUseCoupons().length === 0) {
      this.message.warning('请选择票券');
      return;
    }
    const shopCardDetail = this.shopCardDetail;
    console.log('选择票券');
    console.log(shopCardDetail.uidMember);
    this.passwordSvc.show('', true, shopCardDetail.uidMember).subscribe(password => {
      console.log(password);
      if (!password) {
        return false;
      }
      if (shopCardDetail.priceWillIncome === 0) {
        const payment: any = {};
        payment.payModeCode = 'Cash';
        payment.payAmount = 0;
        const saveBillParams: any = {};
        saveBillParams.uidShopCart = shopCardDetail.uidShopCart;
        saveBillParams.billSaleType = 'SALE';
        // saveBillParams.takeGoodsType = this.modalParams.takeGoodsType;
        saveBillParams.memberInfo = {};
        saveBillParams.payment = payment;
        saveBillParams.paymentList = [payment];
        console.log('saveBillParams-->', saveBillParams);
        this.toastSvc.loading('正在处理...', 0);
        this.checkoutSvc.saveBill(saveBillParams).subscribe(res => {
          this.toastSvc.hide();
          if (res.status.status === 0) {// 成功
            const data: any = {};
            data.billStatus = 'compelete';
            data.saveBillParams = saveBillParams;
            data.saveBillResult = res;
            this.modalController.dismiss(data).then();
          } else if (res.status.status === 29000) {
            const data: any = {};
            data.billStatus = 'compelete';
            data.saveBillParams = saveBillParams;
            data.saveBillResult = res;
            this.modalController.dismiss(data).then();
          } else {
            console.log('支付失败');
            this.message.error(res.status.msg2Client);
          }
        });
      } else {
        const data: any = {
          billStatus: 'paying'
        };
        console.log('关闭票券券页面');
        this.modalController.dismiss(data).then();
      }
    });
  }

  // 取消
  dismiss() {
    if (this.getSelectUseCoupons().length > 0) {
      this.message.warning('已添加票券，请删除后再取消');
      return;
    }
    this.modalController.dismiss().then();
  }

  // 获取选中的票券
  getSelectUseCoupons() {
    let selectList = [];
    const couponList = this.couponList;
    if (couponList && couponList.length > 0) {
      selectList = couponList.filter(function(item, index) {
        return item.used === 1;
      });
    }
    console.log('选中的票券', selectList);
    return selectList;
  }

  pageIndexChange(e) {
    this.page.currentPage = e;
  }

  updateCheckedSet(item: DataItem, checked: boolean): void {
    console.log(item);
    if (checked) {
      this.selected[item.ticketCode] = item;
    } else {
      this.selected[item.ticketCode] = false;
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: ReadonlyArray<any>): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({disabled}) => !disabled);
    this.checked = listOfEnabledData.every((item) => this.selected[item.ticketCode]);
    this.indeterminate = listOfEnabledData.some((item) => this.selected[item.ticketCode]) && !this.checked;
  }

  onItemChecked(item: DataItem, checked: boolean): void {
    this.updateCheckedSet(item, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.filter(({disabled}) => !disabled).forEach((item) => this.updateCheckedSet(item, checked));
    this.refreshCheckedStatus();
  }
}
