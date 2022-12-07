import { Component, ViewChild, AfterViewInit, ElementRef  } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavParams, ModalController } from '@ionic/angular';
import { CheckoutService } from '../../checkout.service';
import { ShoppingCartService } from '../../../shopping-cart/shopping-cart.service';
import { ToastService } from '../../../../@theme/modules/toast';
import { getPage, currentPageData } from '../../../../@theme/modules/pagination/pagination.component';
import { PageDto } from '../../../../@theme/modules/pagination/pagination.dto';

interface DataItem {
  typeName: string;
  ticketCode: string;
  ticketName: string;
  effectDate: string;
  useCondition: string;
  ticketMoney: string;
}

@Component({
  selector: 'app-checkout-useCoupon',
  templateUrl: './useCoupon.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './useCoupon.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class CheckoutUseCouponComponent implements AfterViewInit {
  shopCardDetail;
  form: FormGroup = new FormGroup({
    couponNo: new FormControl('', [])
  });

  checked = false;
  couponList: DataItem[] = [];
  indeterminate = false;
  listOfCurrentPageData: ReadonlyArray<any> = [];
  selected = {};

  // 添加的票券分页
  page: PageDto = {
    currentPage: 1,
    pageSize: 5,
    totalSize: 0
  };
  @ViewChild('couponNoInput', { static: false }) private couponNoInput: ElementRef;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private checkoutSvc: CheckoutService,
              private shoppingCartSvc: ShoppingCartService,
              private message: NzMessageService,
  ) {
    const params = this.navParams.data.params;
    this.shopCardDetail = params.shopCardDetail;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.couponNoInput.nativeElement.focus();
    }, 800);
  }

  change(e) {
    console.log(e);

  }

  getData() {
  }


  couponNoEnter() {
    this.addCoupon();
  }

  // 票券添加验证
  addCoupon() {
    const couponNo = this.form.value.couponNo;
    if (couponNo === '') {
      this.message.warning('请输入票券编码');
      return;
    }
    const params: any = {};
    params.uidShopCart = this.shopCardDetail.uidShopCart;
    params.ticketCode = couponNo;
    params.ticketMode = '1';
    this.toastSvc.loading('正在处理，请稍后...', 0);
    this.checkoutSvc.addTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data) {
        console.log('成功');
        const ticketRs = res.data;
        const resCoupon = {
          typeName: this.getTypeName(ticketRs.ticketType),
          ticketCode: ticketRs.ticketCode,
          ticketName: ticketRs.ticketName,
          effectDate: ticketRs.effectDate,
          useCondition: ticketRs.useCondition,
          ticketMoney: ticketRs.ticketMoney
        };
        this.couponList.push(resCoupon);
        // 表格的数据是工作在onPush下的，需要手动通知数据有更新，主要是为了避免脏检查，手动通知便于提升性能
        this.couponList = [...this.couponList]; // 通知简洁写法
        this.page = getPage(this.couponList, 5);
        this.updateShopcartDetailPrice(ticketRs);
        this.form.get('couponNo').setValue('');
      } else {
        console.log('失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 删除票券验证
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
        const newCoupon = [];
        const couponList = this.couponList;
        couponList.forEach(item => {
          if (item.ticketCode !== coupon.ticketCode) {
            newCoupon.push(item);
          }
        });
        this.couponList = [...newCoupon];
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
  // 票券类型
  getTypeName(type) {
    let name;
    switch (type) {
      case '1':
        name = '兑换券';
        break;
      case '2':
        name = '优惠券';
        break;
      case '3':
        name = '代金券';
        break;
      default:
        name = '';
    }
    return name;
  }
  // 确定下单
  confirm() {
    if (this.couponList && this.couponList.length > 0) {
      const shopCardDetail = this.shopCardDetail;
      if (shopCardDetail.priceWillIncome === 0){
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
      }else{
        const data: any = {
          billStatus: 'paying',
        };
        console.log('关闭团购券页面');
        this.modalController.dismiss(data).then();
      }
    } else {
      this.message.warning('请添加票券');
      return;

    }
  }
  // 取消
  dismiss() {
    if (this.couponList && this.couponList.length > 0) {
      this.message.warning('已添加票券，请删除后再取消');
      return;
    }
    this.modalController.dismiss().then();
  }


  pageChange(e) {
    this.getData();
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
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ disabled }) => !disabled);
    this.checked = listOfEnabledData.every((item) => this.selected[item.ticketCode]);
    this.indeterminate = listOfEnabledData.some((item) => this.selected[item.ticketCode]) && !this.checked;
  }

  onItemChecked(item: DataItem, checked: boolean): void {
    this.updateCheckedSet(item, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.filter(({ disabled }) => !disabled).forEach((item) => this.updateCheckedSet(item, checked));
    this.refreshCheckedStatus();
  }
}
