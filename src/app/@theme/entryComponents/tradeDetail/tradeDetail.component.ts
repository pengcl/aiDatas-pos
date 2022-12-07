import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ToastService } from '../../modules/toast';
import { DatePipe } from '@angular/common';
import { NavParams, ModalController } from '@ionic/angular';
import { AppService } from '../../../app.service';
import { AuthService } from '../../../pages/auth/auth.service';
import { VipService } from '../../../pages/vip/vip.service';
import { getDeletData } from '../../../pages/pickup/pickup.utils';
interface DataItem {
  name: string;
  age: number;
  street: string;
  building: string;
  number: number;
  companyAddress: string;
  companyName: string;
  gender: string;
}

@Component({
  selector: 'app-trade-detail',
  templateUrl: './tradeDetail.component.html',
  styleUrls: ['../../../../theme/ion-modal.scss', './tradeDetail.component.scss'],
  providers: [DatePipe]
})
export class TradeDetailComponent implements OnInit {
  conditon;
  detail;
  ticketPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };
  merPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };

  totalPayDatas = []; // 合计金额

  payPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };

  billSaleType = {
    MEMBER: '会员服务',
    APPEND: '影票补登',
    SALE: '销售',
    REJECT: '退货'
  };

  billStatus = {
    NEW: '新建',
    SYS_CANCEL: '系统取消',
    USER_CANCEL: '用户取消',
    COMPLETE: '完成',
    FAIL: '失败',
    PAYING: '支付中'
  };

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private vipService: VipService,
  ) {
    this.conditon = this.navParams.data.info;
  }

  ngOnInit() {
    this.queryMemTradeRecordDetail();
  }

  // 查询会员交易记录
  queryMemTradeRecordDetail() {
    console.log('查询订单', this.conditon);
    this.detail = null;
    this.ticketPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
    this.merPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };

    this.payPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
    let params: any = {};
    params = this.conditon;
    params.search = this.conditon.billCodeThird;
    this.toastSvc.loading('正在查询，请稍后...', 10000);
    this.vipService.queryMemTradeRecordDetail(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (!res.data) {
          this.message.info('查询不到相关信息');
          return;
        }
        res.data.billSaleTypeLabel = this.billSaleType[res.data.billSaleType];
        res.data.billStatusLabel = this.billStatus[res.data.transactionStatus];
        if (res.data.posBillApproveGd === 0) {
          res.data.posBillApproveGdLabel = '已生效';
        } else {
          res.data.posBillApproveGdLabel = '未生效';
        }
        this.detail = res.data;
        this.ticketPage.datas = this.detail.posBillSeatDetailDTOList;
        this.ticketPage.total = this.ticketPage.datas.length;
        this.detail.posBillResDetailDTOList.forEach(item => {
          if (item.isCombo === 1) {
            item.sum = 1;
          } else {
            item.sum = 1;
          }
          item.isGif = 0;
          this.getDetailLabel(item);
        });
        this.merPage.datas = this.detail.posBillResDetailDTOList;
        // 存在赠送票券
        const tickets = [];
        if (this.detail.gifTicketDTOList && this.detail.gifTicketDTOList.length > 0){
          this.detail.gifTicketDTOList.forEach(item => {
            item.sum = 1;
            item.isGif = 1;
            item.billResPriceOri = '';
            let f = false;
            tickets.forEach(subitem => {
              if (item.resName === subitem.resName){
                subitem.sum = subitem.sum + item.sum;
                f = true;
              }
            });
            if (!f){
              tickets.push(item);
            }
          });
        }
        this.merPage.datas = this.merPage.datas.concat(tickets);
        this.merPage.total = this.merPage.datas.length;
        this.detail.posBillPayDTOList.forEach(item => {
          item.payModeCodeLabel = this.getPayModeCodeLabel(item);
        });
        this.payPage.datas = this.detail.posBillPayDTOList;
        this.payPage.total = this.payPage.datas.length;

        const totalPayDatas = [];
        const totalPayData: any = {};
        totalPayData.totalPrice = this.detail.posBillPayPriceDTO.totalPrice;
        totalPayData.discountCouponPrice = this.detail.posBillPayPriceDTO.discountCouponPrice;
        totalPayData.activePrice = this.detail.posBillPayPriceDTO.activePrice;
        totalPayData.receivablePrice = this.detail.posBillPayPriceDTO.receivablePrice;
        totalPayData.cashCouponPrice = this.detail.posBillPayPriceDTO.cashCouponPrice;
        totalPayData.receiptsPrice = this.detail.posBillPayPriceDTO.receiptsPrice;
        totalPayDatas.push(totalPayData);
        this.totalPayDatas = totalPayDatas;
        console.log('this.totalPayDatas', this.totalPayDatas);
      } else {
        this.message.info(res.status.msg2Client);
      }
    });
  }

  // 商品明细
  getDetailLabel(item) {
    if (item.isCombo === 0) {
      let contailDTOList = [];
      if (item.resType === 2) {
        contailDTOList = getDeletData(item.contailDTOList, 'posResourceCode', 'sSum', '');
      } else {
        contailDTOList = getDeletData(item.contailDTOList, 'uidRes', 'sSum', '');
      }
      const list2 = contailDTOList[2];
      const arr = [];
      list2.forEach(it => {
        arr.push(it.resName + ' X' + it.sSum);
      });
      item.resName = item.resName + '(' + arr.join(',') + ')';
    }
  }

  getPayModeCodeLabel(item) {
    let str = '';
    if (item.payModeCode === 'Coupon') {
      str = item.payInfo;
    } else {
      if (item.payModeName === '会员卡') {
        str = item.payModeName + '号：' + item.payInfo;
      } else if (item.payModeName === '银行卡') {
        str = item.payModeName + '号：' + item.payInfo;
      } else {
        str = '';
      }
    }
    return str;
  }

  dismiss() {
    this.modalController.dismiss().then();
  }
}
