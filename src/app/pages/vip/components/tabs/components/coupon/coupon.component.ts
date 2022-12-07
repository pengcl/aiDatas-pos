import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {DatePipe} from '@angular/common';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {VipService} from '../../../../vip.service';
import {VipCouponsComponent} from '../../../../entryComponents/coupons/coupons';
import {VipGiveComponent} from '../../../../entryComponents/give/give';

@Component({
  selector: 'app-vip-tabs-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsCouponComponent implements OnInit, OnDestroy {
  constructor(private modalController: ModalController,
              private datePipe: DatePipe,
              private message: NzMessageService,
              private vipService: VipService,
              private toastSvc: ToastService) {
  }

  mapOfCheckedId = {};
  memberDetail;
  subscribe;
  form: FormGroup = new FormGroup({
    type: new FormControl('0', []),
    dataType: new FormControl('1', []),
    ticketStatus: new FormControl('2', [])
  });
  page = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 6,
    pageIndex: 1 // 当前页数
  };

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('会员票券tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });

  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    console.log(this.memberDetail);
    this.resetData();
    this.queryMemberTicket();
  }

  resetData() {
    this.page = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 6,
      pageIndex: 1 // 当前页数
    };
  }

  // 查询票券
  async presentCouponsModal() {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: VipCouponsComponent,
      componentProps: {mapOfCheckedId: this.mapOfCheckedId},
      cssClass: 'full-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      const params = {
        memberMobile: this.memberDetail.memberMobile,
        memberCard: this.memberDetail.cardSeleted.cardNo,
        ticketGifts: []
      };
      for (const key in data) {
        if (data[key]) {
          params.ticketGifts.push({
            discountAmount: 1,
            merUid: key,
            ticketName: data[key].ticketName
          });
        }
      }

      this.presentGiveModal(params).then();
    }
  }

  // 操作票券
  async presentGiveModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: VipGiveComponent,
      componentProps: {params},
      cssClass: 'full-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.toastSvc.loading('赠送中...', 0);
      this.vipService.give(data).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          this.toastSvc.success('赠送成功');
        }
        this.changePageIndex(1);
      });
    }
  }

  couponSend() {
    this.presentCouponsModal().then();
  }

  couponQueryBtn() {
    this.page.pageIndex = 1;
    this.page.pageSize = 6;
    this.queryMemberTicket();
  }

  // 查询会员票券
  queryMemberTicket() {
    const params: any = {};
    params.memberMobile = this.memberDetail.memberMobile;
    params.memberPhoneNum = this.memberDetail.memberMobile;
    params.dataType = this.form.get('dataType').value;
    params.type = this.form.get('type').value;
    params.ticketStatus = this.form.get('ticketStatus').value;
    params.page = {
      currentPage: this.page.pageIndex,
      pageSize: this.page.pageSize
    };
    console.log('参数', params);
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipService.queryMemberTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data && res.data.detail) {
          const couponList = res.data.detail;
          if (couponList && couponList.length > 0) {
            couponList.forEach(item => {
              item.categoryName = this.getCategoryName(item.category);
              item.typeName = this.getTypeName(item.type);
              item.ticketStatusName = this.getTicketStatusName(item);
              item.effectDate = this.getEffectDate(item.effectiveDate, item.expirationDate);

            });
          }
          this.page.pageIndex = res.data.page.currentPage;
          this.page.total = res.data.page.totalSize;
          this.page.datas = couponList;
        }
      } else {
        console.log('失败');
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
  getTicketStatusName(ticket) {
    const ticketStatus = ticket.ticketStatus;
    const isValid = ticket.isValid;
    let name;
    switch (ticketStatus) {
      case 1:
        name = '未激活';
        break;
      case 2:
        if (isValid === 1){
          name = '未使用';
        }else{
          name = '未使用（已过期）';
        }
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

  changePageIndex(pageIndex) {
    this.page.pageIndex = pageIndex;
    this.queryMemberTicket();
  }

  changeType(e) {

  }
  changeDataType(e) {

  }

  changeTicketStatus(e) {

  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
