import {AfterViewInit, NgZone, Component, ElementRef, ViewChild} from '@angular/core';
import {DatePipe, LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {OrderService} from '../order.service';
import {Router} from '@angular/router';
import {ToastService} from '../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {getDeletData} from '../../pickup/pickup.utils';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';
import {ReprintViewComponent} from '../../reprint/components/view/view';
import {CheckAuth} from '../../../@core/utils/check-auth';
import {DateUtils} from '../../../@core/utils/date-utils';
import {ChannelViewComponent} from '../components/view/channelview';
import {TradeDetailComponent} from '../../../@theme/entryComponents/tradeDetail/tradeDetail.component';
import {StaffViewComponent} from '../components/staff/staff';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-order-index',
  templateUrl: './index.page.html',
  styleUrls: ['../../supplement/index/index.page.scss', './index.page.scss'],
  providers: [DatePipe, NzMessageService]
})
export class OrderIndexPage implements AfterViewInit {

  detail;
  show = false;
  @ViewChild('autoFocusInput', {static: false}) private autoFocusInput: ElementRef;
  form: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required])
  });
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
  canRefund = false;
  index = 0;

  appendPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };

  showClose = false;
  showChannelClose = false;

  saleTypeDatas = [
    {id : '', name : '全部'},
    {id : 'MEMBER', name : '会员服务'},
    {id : 'APPEND', name : '影票补登'},
    {id : 'SALE', name : '销售'},
    {id : 'REJECT', name : '退货'},
  ];

  billStatusDatas = [
    {id : '', name : '全部'},
    {id : 'NEW', name : '新建'},
    {id : 'SYS_CANCEL', name : '系统取消'},
    {id : 'USER_CANCEL', name : '用户取消'},
    {id : 'COMPLETE', name : '完成'},
    {id : 'FAIL', name : '失败'},
    {id : 'PAYING', name : '支付中'},
  ];

  auditDatas = [
    {id: '', name : '全部'},
    {id: '0', name : '已生效'},
    {id: '-1', name : '未生效'},
  ];

  tableform: FormGroup = new FormGroup({
    tradeDate: new FormControl([], []),
    filmDate: new FormControl([], []),
    ticketSeller: new FormControl('', []),
    movieName: new FormControl('', []),
    posBillStatus: new FormControl('', []),
    billSaleType: new FormControl('', []),
    billCode: new FormControl('', []),
    posBillApproveGd: new FormControl('', []),
    uidPayMode: new FormControl('', []),
    ticketCode: new FormControl('', []),
    channelCode: new FormControl([], []),
    channelCodeLabel: new FormControl('', []),
    memberMobile: new FormControl('', []),
    memberCardNo: new FormControl('', []),
    payVoucherCode: new FormControl('', []),
    billCodeThird: new FormControl('', []),
    ticketBillCode: new FormControl('', []),
    uidCreateUser: new FormControl('', [])
  });

  payDatas = [];
  moreSearch = false;
  init = false;

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private appSvc: AppService,
              public authSvc: AuthService,
              private orderSvc: OrderService,
              private router: Router,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private voucherPrinter: VoucherPrinter,
              private checkAuth: CheckAuth,
              private dateUtils: DateUtils,
              private datePipe: DatePipe) {
  }

  ngAfterViewInit() {
    if (this.authSvc.role('7990')){
      setTimeout(() => {
        this.autoFocusInput.nativeElement.focus();
      }, 500);
    }else  if (this.authSvc.role('7991')){
      this.changeTab(1);
    }else {
      setTimeout(() => {
        this.autoFocusInput.nativeElement.focus();
      }, 500);
    }
  }

  // 键盘事件
  pressQuery(event) {
    if (event && event.keyCode === 13) {
      this.query();
    }
  }

  query() {
    this.message.remove();
    if (!this.form.get('search').value) {
      this.message.warning('请输入订单编码/电影票编号');
      return;
    }
    const params = {
      search: this.form.get('search').value,
      uidComp: this.appSvc.currentCinema.uidComp,
      notErrorInterceptor: true
    };
    this.detail = null;
    this.show = false;
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

    this.totalPayDatas = [];

    this.payPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
    this.canRefund = false;
    this.toastSvc.loading('正在处理...', 10000);
    this.orderSvc.getPosOrderDetail(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (!res.data) {
          this.message.info('查询不到相关信息');
          return;
        }
        this.show = true;
        res.data.billSaleTypeLabel = this.billSaleType[res.data.billSaleType];
        res.data.billStatusLabel = this.billStatus[res.data.transactionStatus];
        if (res.data.transactionStatus === 'COMPLETE' && (res.data.billSaleType === 'SALE' || res.data.billSaleType === 'APPEND')) {
          this.canRefund = true;
        }
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

  clear() {
    this.form.get('search').setValue('');
    this.detail = null;
    this.show = false;
    setTimeout(() => {
      this.autoFocusInput.nativeElement.focus();
    }, 500);
  }

  // 重打印影票
  printTicket(item) {
    const authparams = {
      authFuctionCode: 'operRePrint',
      uidAuthFuction: 'rePrint',
      authFuctionName: '',
      authFuctionType: '1'
    };

    this.checkAuth.auth(authparams, item , () => {
      this.printTickets(item);
    });

  }

  printTickets(item){
    const params = {
      typeCodeList: ['T001'],
      typeCode: 'T001',
      seatCode: item.resCode,
      uidBill: this.detail.uidBill,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    const methodName = '/printTempletService-api/templetPrint/printTemp';
    this.voucherPrinter.print(params, methodName, (ress) => {
      if (ress.status === '0') {
        this.message.success(ress.msg, {nzDuration: 2000});
      } else {
        this.message.error(ress.msg, {nzDuration: 2000});
      }
    });

    const printParams = {
      uidTicketCert: item.uidTicketCert
    };
    this.orderSvc.updatePrintTime(printParams).subscribe(res => {
      console.log('重打印--updatePrintTime！！');
      console.log(res);
    });
  }

  // 显示明细界面
  async view(pars) {
    const params = {
      uid: this.detail.uidBill,
      uidComp: this.appSvc.currentCinema.uidComp,
      billCode: this.detail.billCode,
      billAmount: this.detail.billAmount,
      terminalCode: this.detail.terminalCode,
      billCreateName: this.detail.saleUser,
      billSaleType: this.detail.billSaleType,
      createTime: this.detail.createTime,
      payModeList: [],
      billSaleTypeLabel: this.detail.billSaleTypeLabel,
      detailLabel: ''
    };
    const detailArr = [];
    if (this.merPage.total > 0) {
      this.merPage.datas.forEach(item => {
        if (item.isGif !== 1){
          detailArr.push(item.resName + 'X' + item.sum);
        }
      });
    }
    if (this.ticketPage.total > 0) {
      detailArr.push('电影票X' + this.ticketPage.total);
    }
    params.detailLabel = detailArr.join('、');
    if (this.payPage.total > 0) {
      this.payPage.datas.forEach(item => {
        const obj = {
          billPayAmount: item.billPayAmount,
          payModeCode: item.payModeCode,
          payModeName: item.payModeName,
          isRefund: item.isRefund,
          refundAmount: item.billPayAmount
        };
        params.payModeList.push(obj);
      });
    }

    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ReprintViewComponent,
      componentProps: {params},
      cssClass: 'reprint-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {

    }
  }

  viewVoucher(pars){
    const authparams = {
      authFuctionCode: 'operRePrint',
      uidAuthFuction: 'rePrint',
      authFuctionName: '',
      authFuctionType: '1'
    };
    this.checkAuth.auth(authparams, pars , () => {
      this.view(pars);
    });
  }

  refundTicket() {
    const authparams = {
      authFuctionCode: 'operRefund',
      uidAuthFuction: 'retreatTicket',
      authFuctionName: '',
      authFuctionType: '4'
    };
    this.checkAuth.auth(authparams, null , () => {
      this.openRefundPage();
    });
  }

  // 跳转界面
  openRefundPage(){
    const params = {
      billCode: this.detail.billCode
    };
    this.zone.run(() => {
      this.router.navigate(['/refund/index'], {queryParams: params}).then();
    });
  }

  // 切换
  changeTab(index) {
    if (this.index === index){
      return;
    }
    this.index = index;
    if (this.index === 1){
      if (!this.init){
        const datestr = this.datePipe.transform(new Date(), 'yyyy-MM-dd') + ' 06:00';
        const today = new Date(datestr);
        const nextDate = this.dateUtils.addDay(today, 1);
        const datas = [];
        datas.push(today);
        datas.push(nextDate);
        this.tableform.get('tradeDate').setValue(datas);
        this.tableform.get('posBillStatus').setValue('COMPLETE');
        // 查询支付方式
        this.queryPayList();
        this.init = true;
      }
    }else{
      setTimeout(() => {
        this.autoFocusInput.nativeElement.focus();
      }, 500);
    }
  }

  queryPayList(){
    this.payDatas = [
      {uid: '', modeName: '全部'}
    ];
    const params = {
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.orderSvc.getPosPayModeBill(params).subscribe(res => {
      if (res.status.status === 0) {
        this.payDatas =  this.payDatas.concat(res.data);
      }
    });
  }

  changePageSize(pageSize) {
    this.appendPage.pageSize = pageSize;
    this.queryOrder(1);
  }

  changePageIndex(pageIndex) {
    this.appendPage.pageIndex = pageIndex;
    this.queryOrder(1);
  }

  onCalendarChange(e, type){
    if (type === 0){
      this.tableform.get('tradeDate').setValue(e);
    }else{
      this.tableform.get('filmDate').setValue(e);
    }
  }

  moreSearchBtn(){
    if (this.moreSearch){
      this.moreSearch = false;
    }else {
      this.moreSearch = true;
    }
  }

  queryOrder(type){
    let end = '';
    let start = '';
    const date = this.tableform.get('tradeDate').value;
    if (date.length !== 2){
      this.message.warning('请选择交易时间');
      return;
    }
    const filmDate = this.tableform.get('filmDate').value;
    if (filmDate.length > 0 && filmDate.length !== 2){
      this.message.warning('请选择放映时间');
      return;
    }
    const billCode = this.tableform.get('billCode').value;
    const billSaleType = this.tableform.get('billSaleType').value;
    const memberCardNo = this.tableform.get('memberCardNo').value;
    const movieName = this.tableform.get('movieName').value;
    const payVoucherCode = this.tableform.get('payVoucherCode').value;
    const posBillApproveGd = this.tableform.get('posBillApproveGd').value;
    const posBillStatus = this.tableform.get('posBillStatus').value;
    const memberMobile = this.tableform.get('memberMobile').value;
    const ticketCode = this.tableform.get('ticketCode').value;
    const ticketSeller = this.tableform.get('ticketSeller').value;
    const billCodeThird = this.tableform.get('billCodeThird').value;
    const uidPayMode = this.tableform.get('uidPayMode').value;
    const channelCustomCodeList = this.tableform.get('channelCode').value;
    const uidCreateUser = this.tableform.get('uidCreateUser').value;
    const ticketBillCode = this.tableform.get('ticketBillCode').value;
    if (date.length === 2){
      end = this.datePipe.transform(date[1], 'yyyy-MM-dd HH:mm');
      start = this.datePipe.transform(date[0], 'yyyy-MM-dd HH:mm');
      const start1 = new Date(start);
      const end1 = new Date(end);
      const nextDate = this.dateUtils.addDay(start1, 7);
      if (end1 >= nextDate){
        this.message.warning('交易时间限制七天范围内', {nzDuration : 2000});
        return;
      }
    }
    let startShowTime = '';
    let endShowTime = '';
    if (filmDate.length === 2){
      endShowTime = this.datePipe.transform(filmDate[1], 'yyyy-MM-dd HH:mm');
      startShowTime = this.datePipe.transform(filmDate[0], 'yyyy-MM-dd HH:mm');
      const start1 = new Date(startShowTime);
      const end1 = new Date(endShowTime);
      const nextDate = this.dateUtils.addDay(start1, 7);
      if (end1 >= nextDate){
        this.message.warning('放映时间限制七天范围内', {nzDuration : 2000});
        return;
      }
    }

    if (type === 0){
      this.appendPage = {
        datas: [],
        loading: false,
        total: 0, // 总数
        pageSize: 8,
        pageIndex: 1 // 当前页数
      };
    }
    const params = {
      billCode,
      billSaleType,
      uidComp: this.appSvc.currentCinema.uidComp,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      cinemaName: this.appSvc.currentCinema.cinemaName,
      endShowTime,
      endTime: end,
      memberCardNo,
      movieName,
      payVoucherCode,
      posBillApproveGd,
      posBillStatus,
      startShowTime,
      startTime: start,
      memberMobile,
      ticketCode,
      ticketSeller,
      billCodeThird,
      uidCreateUser,
      uidPayMode,
      channelCustomCodeList,
      ticketBillCode,
      page: {
        currentPage: this.appendPage.pageIndex,
        pageSize: this.appendPage.pageSize
      }
    };

    this.appendPage.loading = true;
    this.orderSvc.getOrderList(params).subscribe(res => {
      this.appendPage.loading = false;
      if (res.status.status === 0) {
        this.appendPage.pageIndex = res.data.page.currentPage;
        this.appendPage.total = res.data.page.totalSize;
        let datas = [];
        if (res.data.detail && res.data.detail.length > 0){
          datas = res.data.detail;
          datas.forEach(item => {
            const bs = this.getLabel(this.saleTypeDatas, item.billSaleType);
            if (bs){
              item.billSaleTypeLabel = bs.name;
            }
            const status = this.getLabel(this.billStatusDatas, item.posBillStatus);
            if (status){
              item.billTypeLabel = status.name;
            }
            const approved = this.getLabel(this.auditDatas, item.posBillApproveGd + '');
            if (approved){
              item.posBillApproveGdLabel = approved.name;
            }
          });
        }
        this.appendPage.datas = datas;
      }else{
        this.message.error(res.status.msg2Client);
      }
    });

  }

  getLabel(datas, id){
    const list = datas.filter(item => (item.id === id));
    if (list && list.length > 0){
      return list[0];
    }
    return null;
  }

  clearOrder(){
    this.tableform.get('filmDate').setValue([]);
    this.tableform.get('billCode').setValue('');
    this.tableform.get('billSaleType').setValue('');
    this.tableform.get('memberCardNo').setValue('');
    this.tableform.get('movieName').setValue('');
    this.tableform.get('payVoucherCode').setValue('');
    this.tableform.get('posBillApproveGd').setValue('');
    this.tableform.get('memberMobile').setValue('');
    this.tableform.get('ticketCode').setValue('');
    this.tableform.get('ticketSeller').setValue('');
    this.tableform.get('uidCreateUser').setValue('');
    this.tableform.get('billCodeThird').setValue('');
    this.tableform.get('uidPayMode').setValue('');
    this.tableform.get('channelCode').setValue([]);
    this.tableform.get('channelCodeLabel').setValue('');
    this.tableform.get('ticketBillCode').setValue('');
    const datestr = this.datePipe.transform(new Date(), 'yyyy-MM-dd') + ' 06:00';
    const today = new Date(datestr);
    const nextDate = this.dateUtils.addDay(today, 1);
    const datas = [];
    datas.push(today);
    datas.push(nextDate);
    this.tableform.get('tradeDate').setValue(datas);
    this.tableform.get('posBillStatus').setValue('COMPLETE');
  }

  async viewDetail(rowData) {
    const info = {
      uidComp: rowData.uidComp,
      uidBill: rowData.uid,
      billCodeThird: rowData.billCode
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TradeDetailComponent,
      componentProps: { info },
      cssClass: 'full-modal'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }

  // 显示明细界面
  async viewStaffModal() {
    const params = {
      uidComp : this.appSvc.currentCinema.uidComp
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: StaffViewComponent,
      componentProps: {params},
      cssClass: 'supplement-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.tableform.get('uidCreateUser').setValue(data.uid);
      this.tableform.get('ticketSeller').setValue(data.staffName);
      this.showClose = true;
    }
  }

  clearStaff(){
    this.tableform.get('uidCreateUser').setValue('');
    this.tableform.get('ticketSeller').setValue('');
    this.showClose = false;
  }

  // 渠道
  async viewChannelModal() {
    const channelCustomCodeList = this.tableform.get('channelCode').value;
    const params = {
      status: 0,
      channelCode: channelCustomCodeList
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ChannelViewComponent,
      componentProps: {params},
      cssClass: 'channel-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      const channelCode = [];
      const channelNames = [];
      data.forEach(item => {
        channelCode.push(item.channelCode);
        channelNames.push(item.channelName);
      });
      this.tableform.get('channelCode').setValue(channelCode);
      this.tableform.get('channelCodeLabel').setValue(channelNames.join(','));
      if (channelCode.length > 0){
        this.showChannelClose = true;
      }else{
        this.showChannelClose = false;
      }
    }
  }

  clearChannel(){
    this.tableform.get('channelCode').setValue([]);
    this.tableform.get('channelCodeLabel').setValue('');
    this.showChannelClose = false;
  }

  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }
}
