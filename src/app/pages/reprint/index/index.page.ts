import {AfterViewInit, NgZone, Component} from '@angular/core';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {ReprintService} from '../reprint.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {getReprintResComboListData, getDeletData} from '../../pickup/pickup.utils';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';
import {ReprintViewComponent} from '../components/view/view';
import {AuthService} from '../../auth/auth.service';
import {CheckAuth} from '../../../@core/utils/check-auth';

@Component({
  selector: 'app-reprint-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService]
})
export class ReprintIndexPage implements AfterViewInit {

  form: FormGroup = new FormGroup({
    timeType: new FormControl('', [Validators.required]),
    billCode: new FormControl('', [Validators.required])
  });
  ticketform: FormGroup = new FormGroup({
    timeType: new FormControl('', [Validators.required]),
    billCode: new FormControl('', [Validators.required])
  });
  index = 0;
  voucherPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };
  ticketPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };

  billSaleTypeMap = {
    memCardCost: '会员开卡',
    memCardNewRecharge: '会员开卡',
    memCardRecharge: '会员充值',
    memCardChange: '换卡手续',
    memCardRepair: '会员补卡',
    memCardCancel: '会员销卡',
    APPEND: '影票补登',
    SALE: '销售',
    REJECT: '退货',
    memCardContinue: '会员续期',
    memCardSterilisation: '充值冲销',
    memCardReject: '会员销卡'
  };

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private appSvc: AppService,
              public authSvc: AuthService,
              private route: ActivatedRoute,
              private reprintSvc: ReprintService,
              private router: Router,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private checkAuth: CheckAuth,
              private voucherPrinter: VoucherPrinter) {
  }

  ngAfterViewInit() {
    if (this.authSvc.role('7930')) {
      this.changeTab(0);
    } else if (this.authSvc.role('7931')) {
      this.changeTab(1);
    }
    if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.billCode) {
      this.index = 1;
      this.ticketform.get('billCode').setValue(this.route.snapshot.queryParams.billCode);
      this.ticketform.get('timeType').setValue('3');
      this.queryTicket();
    } else {
      this.form.get('timeType').setValue('1');
    }
  }

  // 切换
  changeTab(index) {
    if (index === this.index) {
      return;
    }
    // this.toastSvc.loading('123', 500);
    this.index = index;
    if (this.index === 0) {
      this.clear();
    } else {
      this.clearTicket();
    }
  }

  // --------------------------重打凭证---------------------------
  // 键盘事件
  pressQuery(event) {
    if (!this.form.get('billCode').value) {
      return;
    }
    if (event && event.keyCode === 13) {
      this.query();
    }
  }

  clear() {
    this.form.get('timeType').setValue('1');
    this.form.get('billCode').setValue('');
    this.voucherPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
  }

  // 查询
  query() {
    const params = {
      billCode: this.form.get('billCode').value,
      timeType: this.form.get('timeType').value,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidComp: this.appSvc.currentCinema.uidComp,
      notErrorInterceptor: true,
      page: {
        currentPage: this.voucherPage.pageIndex,
        pageSize: this.voucherPage.pageSize
      }
    };
    this.voucherPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
    this.toastSvc.loading('正在处理...', 20000);
    this.reprintSvc.getReprintCertlist(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data.detail && res.data.detail.length > 0) {
          res.data.detail.forEach(item => {
            item.billSaleTypeLabel = this.billSaleTypeMap[item.billSaleType];
            item.detailLabel = this.getDetailLabel(item);
          });
          this.voucherPage.pageIndex = res.data.page.currentPage;
          this.voucherPage.total = res.data.page.totalSize;
          this.voucherPage.datas = res.data.detail;
        } else {
          this.message.info('查询不到数据');
        }
      } else {
        this.message.info('查询不到数据');
      }
    });
  }

  // 商品明细
  getDetailLabel(item) {
    const resComboList = item.resComboList;
    const resList = item.resList;
    const ticketList = item.ticketList;
    let allArr = [];
    if (resComboList && resComboList.length > 0) {
      const comboList = getReprintResComboListData(resComboList, '*');
      const arr = [];
      comboList.forEach(it => {
        let substr = '';
        if (it.nameResStr !== '') {
          substr = '(' + it.nameResStr + ')';
        }
        arr.push(it.billResName + substr + 'X' + it.pSum);
      });
      allArr = allArr.concat(arr);
    }
    if (resList && resList.length > 0) {
      const list = getDeletData(resList, 'uidPosResource', 'sSum', '');
      const resDatas = list[2];
      const arr = [];
      resDatas.forEach(it => {
        arr.push(it.billResName + 'X' + it.sSum);
      });
      allArr = allArr.concat(arr);
    }
    if (ticketList && ticketList.length > 0) {
      allArr.push('电影票X' + ticketList.length);
    }
    return allArr.join('、');
  }

  changePageIndex(pageIndex) {
    this.voucherPage.pageIndex = pageIndex;
    this.query();
  }

  // 查看
  view(params) {
    this.viewModal(params).then();
  }

  // 显示明细界面
  async viewModal(params) {
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

  // ------------------------重打印电影票--------------------------------
  // 键盘事件
  pressQueryTicket(event) {
    if (!this.ticketform.get('billCode').value) {
      return;
    }
    if (event && event.keyCode === 13) {
      this.queryTicket();
    }
  }

  clearTicket() {
    this.ticketform.get('timeType').setValue('1');
    this.ticketform.get('billCode').setValue('');
    this.ticketPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };

  }

  // 查询
  queryTicket() {
    let billCode = this.ticketform.get('billCode').value;
    if (billCode) {
      if (billCode.indexOf('|') !== -1) {
        const tcodes = billCode.split('|');
        billCode = '0000000' + tcodes[0];
      }
      if (billCode.length === 6 || billCode.length === 12) {
        // 6位取票号，前面补0
        billCode = '0000000000' + billCode.substring(0, 6);
      } else if (billCode.length === 9 || billCode.length === 15) {
        // 9位取票号，前面补0
        billCode = '0000000' + billCode.substring(0, 9);
      }
    }
    const params = {
      billCode,
      timeType: this.ticketform.get('timeType').value,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidComp: this.appSvc.currentCinema.uidComp,
      notErrorInterceptor: true,
      page: {
        currentPage: this.ticketPage.pageIndex,
        pageSize: this.ticketPage.pageSize
      }
    };
    this.ticketPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
    this.toastSvc.loading('正在处理...', 20000);
    this.reprintSvc.getReprintTicketlist(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data.detail && res.data.detail.length > 0) {
          res.data.detail.forEach(item => {
            item.statusLabel = this.getStatusLabel(item.status);
            item.changeLabel = this.getChangeLabel(item);
            item.seatlabel = this.getSeatLabel(item);
          });
          this.ticketPage.pageIndex = res.data.page.currentPage;
          this.ticketPage.total = res.data.page.totalSize;
          this.ticketPage.datas = res.data.detail;
        } else {
          this.message.info('查询不到数据');
        }
      } else {
        this.message.info('查询不到数据');
      }
    });
  }

  getChangeLabel(item) {
    return item.movieName + '(' + item.posMovieLan + '/' + item.planMoviePublish + ')' + '|' + item.hallName + ' ' + item.movieShowTime;
  }

  getSeatLabel(item) {
    return item.seatRow + '排' + item.seatCol + '号';
  }

  getStatusLabel(status) {
    switch (status) {
      case 0:
        return '未打票';
        break;
      case 1:
        return '已打票';
        break;
      case 2:
        return '已退票';
        break;
    }
  }

  changeTicketPageIndex(pageIndex) {
    this.ticketPage.pageIndex = pageIndex;
    this.queryTicket();
  }

  askForReprint(item) {
    const params = {
      authFuctionCode: 'operRePrint',
      uidAuthFuction: 'rePrint',
      authFuctionName: '重打印',
      authFuctionType: '4'
    };
    this.checkAuth.auth(params, null, (type) => {
      this.printTicket(item);
    });
  }

  // 重打印影票
  printTicket(item) {
    console.log(item);
    const params = {
      typeCodeList: ['T001'],
      typeCode: 'T001',
      seatCode: item.seatCode,
      uidBill: item.uidPosBill,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    const methodName = '/printTempletService-api/templetPrint/printTemp';
    this.voucherPrinter.print(params, methodName, (ress) => {
      this.message.remove();
      if (ress.status === '0') {
        this.message.success(ress.msg, {nzDuration: 2000});
      } else {
        this.message.error(ress.msg, {nzDuration: 2000});
      }
    });

    const printParams = {
      uidTicketCert: item.uid
    };
    this.reprintSvc.updatePrintTime(printParams).subscribe(res => {
      console.log('重打印--updatePrintTime！！');
      console.log(res);
    });
  }

  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }
}
