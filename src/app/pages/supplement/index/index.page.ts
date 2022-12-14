import {OnInit, NgZone, Component, ViewChild} from '@angular/core';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {SupplementService} from '../supplement.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {ToastService} from '../../../@theme/modules/toast';
import {MatPaginator} from '@angular/material/paginator';
import {AuthService} from '../../auth/auth.service';
import {ShoppingCartService} from '../../shopping-cart/shopping-cart.service';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';
import {PublicUtils} from '../../../@core/utils/public-utils';
import {DatePipe} from '@angular/common';
import {WeekPipe} from '../../../@theme/pipes/pipes.pipe';
import {DateUtils} from '../../../@core/utils/date-utils';
import {Pagination} from '../../../@core/utils/pagination';
import {DialogService} from '../../../@theme/modules/dialog';
import {ViewComponent} from '../components/view/view';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-refund-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [DatePipe, WeekPipe, NzMessageService, NzModalService]
})
export class SupplementIndexPage implements OnInit {

  form: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required])
  });
  appendform: FormGroup = new FormGroup({
    ticketPrice: new FormControl('', [Validators.required]),
    ticketNum: new FormControl('', [Validators.required]),
    uidPayMode: new FormControl('', [Validators.required])
  });
  tableform: FormGroup = new FormGroup({
    start: new FormControl('', []),
    end: new FormControl('', []),
    status: new FormControl('', []),
    movieName: new FormControl('', []),
    hall: new FormControl('', [])
  });

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) blockPaginator: MatPaginator;
  index = 0;
  clickFlag = false;
  hallDatas;
  hallUid;
  planDatas;
  plan;
  planDetail = {
    seatTotalNum: '',
    posMovieNameHall: '',
    newTime: '',
    hallNameHall: '',
    posStartTime: '',
    showMovieName: ''
  };
  payDatas;
  planDate = {
    label: '',
    name: ''
  };
  totalPrice = '0';
  page = {
    size: 8,             // ??????????????????
    showPage: 1,
    curPage: 0,             // ?????????
    isLastPage: false,             // ????????????
    isFirstPage: false,            // ????????????
    totalPageSize: 0,       // ?????????
    totalCount: 0,       // ???????????????
    showData: [],  // ??????????????????????????????
    showDataCount: 0  // ????????????????????????
  };

  appendPage = {
    applyDatas: [],
    loading: false,
    total: 0, // ??????
    pageSize: 8,
    pageIndex: 1 // ????????????
  };

  addPage = {
    applyDatas: [],
    loading: false,
    total: 0, // ??????
    pageSize: 6,
    pageIndex: 1 // ????????????
  };

  canCommit = false;
  hideEmptyPlan = true;
  hideEmptyMovie = true;

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private appSvc: AppService,
              public authSvc: AuthService,
              private dialogSvc: DialogService,
              private router: Router,
              private route: ActivatedRoute,
              private supplementSvc: SupplementService,
              private toastSvc: ToastService,
              private shoppingCartSvc: ShoppingCartService,
              private voucherPrinter: VoucherPrinter,
              private publicUtils: PublicUtils,
              private datePipe: DatePipe,
              private weekDate: WeekPipe,
              private dateUtils: DateUtils,
              private pagination: Pagination,
              private message: NzMessageService,
              private nzmodal: NzModalService) {

  }

  ngOnInit() {

    if (this.authSvc.role('790')){
      this.changeTab(0);
    }else if (this.authSvc.role('791')){
      this.changeTab(1);
    }

    this.form.get('date').valueChanges.subscribe(res => {
      this.initPlanDate();
      this.initDatas();
    });
    this.form.get('date').setValue(new Date());

    this.appendform.get('ticketPrice').valueChanges.subscribe(res => {
      this.calculatePrice();
    });
    this.appendform.get('ticketNum').valueChanges.subscribe(res => {
      this.calculatePrice();
    });
  }

  calculatePrice() {
    const ticketPrice = this.appendform.get('ticketPrice').value;
    const ticketNum = this.appendform.get('ticketNum').value;
    const reg = /^([1-9][0-9]*)$/;
    if (!reg.test(ticketNum)) {
      return;
    }
    const reg2 = /^[0-9]+(.[0-9]{1,2})?$/;
    if (!reg2.test(ticketPrice)) {
      return;
    }
    if (ticketPrice && ticketNum) {
      this.totalPrice = (ticketPrice * ticketNum).toFixed(2);
    }
  }

  // ?????????????????????
  initPlanDate() {
    const today = this.form.get('date').value;
    const datestr = this.datePipe.transform(today, 'yyyy-MM-dd');
    const week = this.weekDate.transform(today);
    const name = datestr + '       ' + week;
    const label = this.dateUtils.getTodayTomorrowName(today);
    this.planDate.name = name;
    this.planDate.label = label;
  }

  // ??????
  prev() {
    const date = new Date(this.form.get('date').value);
    const preDate = this.dateUtils.addDay(date, -1);
    this.form.get('date').setValue(preDate);
  }

  // ??????
  next() {
    const date = new Date(this.form.get('date').value);
    const nextDate = this.dateUtils.addDay(date, 1);
    this.form.get('date').setValue(nextDate);
  }

  // ??????
  changeTab(index) {
    if (index === this.index) {
      return;
    }
    this.index = index;
    if (this.index === 0) {
      this.init();
    } else {
      this.initApply();
    }
  }

  // ???????????????
  initDatas() {
    if (this.hallUid) {
      this.initPlans();
    } else {
      console.log('???????????????');
      const params = {
        uidComp: this.appSvc.currentCinema.uidComp
      };
      this.toastSvc.loading('????????????...', 20000);
      this.supplementSvc.getFieldByUidList(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          if (res.data && res.data.length > 0) {
            this.hallDatas = res.data;
            this.hallUid = res.data[0].uid;
            this.initPlans();
          }
        }
      });
    }
  }

  // ??????
  prevPage() {
    if (this.page.isFirstPage) {
      return;
    }
    this.page.curPage = this.page.curPage - 1;
    this.pagination.getPageData(this.page.size, this.page.curPage, this.planDatas, (page) => {
      this.page = page;
      this.plan = page.showData[0];
      this.initPlanInfo();
    });
  }

  // ??????
  nextPage() {
    if (this.page.isLastPage) {
      return;
    }
    this.page.curPage = this.page.curPage + 1;
    this.pagination.getPageData(this.page.size, this.page.curPage, this.planDatas, (page) => {
      this.page = page;
      this.plan = page.showData[0];
      this.initPlanInfo();
    });
  }

  initPlans() {
    console.log('???????????????');
    if (!this.hallUid) {
      return;
    }
    const today = this.form.get('date').value;
    const datestr = this.datePipe.transform(today, 'yyyy-MM-dd');
    const params = {
      showType: 'tuxing',
      uidComp: this.appSvc.currentCinema.uidComp,
      planApproveStatus: 2,
      uidField: this.hallUid,
      date: datestr
    };
    this.page = {
      size: 8,             // ??????????????????
      showPage: 1,
      curPage: 0,             // ?????????
      isLastPage: false,             // ????????????
      isFirstPage: false,            // ????????????
      totalPageSize: 0,       // ?????????
      totalCount: 0,       // ???????????????
      showData: [],  // ??????????????????????????????
      showDataCount: 0  // ????????????????????????
    };
    this.plan = null;
    this.planDetail = {
      seatTotalNum: '',
      posMovieNameHall: '',
      newTime: '',
      hallNameHall: '',
      posStartTime: '',
      showMovieName: ''
    };
    this.canCommit = false;
    this.hideEmptyPlan = true;
    this.hideEmptyMovie = true;
    this.toastSvc.loading('????????????...', 20000);
    this.supplementSvc.getPlans(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data && res.data.length > 0) {
          res.data.forEach(item => {
            if (item.showTimeStart) {
              item.showTimeStartLabel = this.getStartTimeLabel(item.showTimeStart);
            }
            item.planLanguageNames = item.planLanguageName;
            item.planMoviePublishs = item.planMoviePublish;
            if (item.planLanguageName && item.planLanguageName.length > 2) {
              item.planLanguageName = item.planLanguageName.substring(0, 2);
            }
            if (item.planMoviePublish && item.planMoviePublish.length > 2) {
              item.planMoviePublish = item.planMoviePublish.substring(0, 2);
            }
          });
          this.planDatas = res.data;
          this.pagination.getPageData(this.page.size, this.page.curPage, this.planDatas, (page) => {
            this.page = page;
            this.plan = page.showData[0];
            this.initPlanInfo();
          });
        } else {
          this.hideEmptyPlan = false;
          this.hideEmptyMovie = false;
        }
      } else {
        this.hideEmptyPlan = false;
        this.hideEmptyMovie = false;
      }
    });
  }

  initPlanInfo() {
    if (!this.plan) {
      return;
    }
    const params = {
      uidPlan: this.plan.uid
    };
    this.appendform.get('ticketPrice').setValue('');
    this.appendform.get('ticketNum').setValue('');
    this.appendform.get('uidPayMode').setValue('');
    this.totalPrice = '0';
    this.planDetail = {
      seatTotalNum: '',
      posMovieNameHall: '',
      newTime: '',
      hallNameHall: '',
      posStartTime: '',
      showMovieName: ''
    };
    this.hideEmptyMovie = true;
    this.supplementSvc.getPlanInfo(params).subscribe(res => {
      if (res.status.status === 0) {
        res.data.seatTotalNum = res.data.canSaleSeatNum;
        res.data.seatTotalNum += ' (???????????????' + res.data.totalSeatNum + ',???????????????' + res.data.saleSeatNum + ',?????????' + res.data.badSeatNum + ')';
        res.data.posMovieNameHall = res.data.posMovieName + '(' + res.data.planMoviePublish + '/' + res.data.posMovieLan + ')';
        res.data.newTime = res.data.posStartTime + ' ??? ' + res.data.posEndTime;
        res.data.hallNameHall = res.data.hallName + '(' + res.data.typeHall + ')';
        res.data.showMovieName = res.data.posMovieNameHall + ' /' + res.data.posStartTime + '/' + res.data.hallName;
        this.planDetail = res.data;
      } else {
        this.hideEmptyMovie = false;
      }
    });
    this.initPayInfo();
    this.initAppendList();
  }

  initPayInfo() {
    if (this.payDatas) {
      return;
    }
    const params = {
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.payDatas = null;
    this.canCommit = false;
    this.supplementSvc.getPosPayModeList(params).subscribe(res => {
      if (res.status.status === 0) {
        if (res.data && res.data.length > 0) {
          this.payDatas = res.data;
        }
      }
    });
  }

  initAppendList() {
    if (!this.plan) {
      return;
    }
    const params = {
      uidPlan: this.plan.uid
    };
    this.canCommit = false;
    this.addPage = {
      applyDatas: [],
      loading: false,
      total: 0, // ??????
      pageSize: 6,
      pageIndex: 1 // ????????????
    };
    this.addPage.loading = true;
    this.supplementSvc.getPlanAppendDetailList(params).subscribe(res => {
      this.addPage.loading = false;
      if (res.status.status === 0) {
        res.data.forEach(item => {
          if (item.status === 0) {
            item.statusName = '?????????';
            if (!this.canCommit) {
              this.canCommit = true;
            }
          } else if (item.status === 1) {
            item.statusName = '?????????';
          } else if (item.status === 2) {
            item.statusName = '?????????';
          }

          if (item.isOverTime === 0) {
            item.isOverTimeName = '?????????';
          } else if (item.isOverTime === -1) {
            item.isOverTimeName = '?????????';
          }
        });
        this.addPage.applyDatas = res.data;
      }
    });
  }

  getStartTimeLabel(start) {
    let str = '';
    const arr = start.split(' ');
    const str2 = arr[1].split(':');
    str = str2[0] + ':' + str2[1];
    return str;
  }

  // ????????????
  changeHall(e) {
    this.hallUid = e;
    this.initPlans();
  }

  // ????????????
  selectPlan(p) {
    if (p.uid === this.plan.uid) {
      return;
    }
    this.plan = p;
    this.initPlanInfo();
  }

  init() {
    this.hallUid = null;
    this.page = {
      size: 8,             // ??????????????????
      showPage: 1,
      curPage: 0,             // ?????????
      isLastPage: false,             // ????????????
      isFirstPage: false,            // ????????????
      totalPageSize: 0,       // ?????????
      totalCount: 0,       // ???????????????
      showData: [],  // ??????????????????????????????
      showDataCount: 0  // ????????????????????????
    };
    this.form.get('date').setValue(new Date());
  }

  // ??????
  append() {
    const ticketPrice = this.appendform.get('ticketPrice').value;
    const ticketNum = this.appendform.get('ticketNum').value;
    const uidPayMode = this.appendform.get('uidPayMode').value;
    if (!this.appendform.valid) {
      if (ticketPrice === '') {
        this.message.warning('???????????????');
      } else if (ticketNum === '') {
        this.message.warning('???????????????');
      } else if (uidPayMode === '') {
        this.message.warning('?????????????????????');
      }
      return;
    }
    // ????????????
    const reg = /^([1-9][0-9]*)$/;
    if (!reg.test(ticketNum)) {
      this.message.warning('???????????????????????????');
      return;
    }
    const reg2 = /^[0-9]+(.[0-9]{1,2})?$/;
    if (!reg2.test(ticketPrice)) {
      this.message.warning('?????????????????????,???????????????2?????????');
      return;
    }
    // ????????????
    if (ticketPrice < this.plan.planLimitPrice) {
      this.message.warning('???????????????????????????????????????????????????' + this.plan.planLimitPrice);
      return;
    }
    if (this.clickFlag){
      return;
    }
    this.clickFlag = true;
    setTimeout(() => {
      this.clickFlag = false;
    }, 2000);
    const pay = {
      payModeCode: '',
      payModeName: ''
    };
    this.payDatas.forEach(item => {
      if (item.uid === uidPayMode) {
        pay.payModeCode = item.modeCode;
        pay.payModeName = item.modeName;
      }
    });
    const params = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      payModeCode: pay.payModeCode,
      payModeName: pay.payModeName,
      ticketNum,
      ticketPrice,
      uidComp: this.appSvc.currentCinema.uidComp,
      uidPayMode,
      uidPlan: this.plan.uid,
      notErrorInterceptor: true
    };
    this.toastSvc.loading('????????????...', 1000);
    this.supplementSvc.append(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.appendform.get('ticketPrice').setValue('');
        this.appendform.get('ticketNum').setValue('');
        this.appendform.get('uidPayMode').setValue('');
        this.initPlanInfo();
      } else {
        this.message.warning(res.status.msg2Client);
      }
    });
  }

  // ??????
  delete(item) {
    if (!item.uid) {
      return;
    }
    this.nzmodal.confirm({
      nzTitle: '??????????????????',
      nzContent: '',
      nzOkText: '??????',
      nzOkType: 'primary',
      // nzOkDanger: true,
      nzOnOk: () => {
        const params = {
          uid: item.uid
        };
        this.toastSvc.loading('????????????...', 1000);
        this.supplementSvc.delAppend(params).subscribe(res => {
          this.toastSvc.hide();
          if (res.status.status === 0) {
            this.message.success('????????????', {nzDuration: 2000});
            this.initPlanInfo();
          } else {
            this.message.error('????????????', {nzDuration: 2000});
          }
        });
      },
      nzCancelText: '??????',
      nzOnCancel: () => {

      }
    });
  }

  // ????????????
  commitAppend() {
    if (this.clickFlag){
      return;
    }
    this.clickFlag = true;
    setTimeout(() => {
      this.clickFlag = false;
    }, 2000);
    const uidList = [];
    this.addPage.applyDatas.forEach(item => {
      uidList.push(item.uid);
    });
    const params = {
      terminalCode: this.authSvc.currentTerminalCode,
      uidList
    };
    this.toastSvc.loading('????????????...', 30000);
    this.supplementSvc.commitAppend(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.canCommit = false;
        this.message.success(res.data.message, {nzDuration: 2000});
        this.initPlanInfo();
      }
    });
  }

  checkPrice(event) {

  }

  checkNum(event) {

  }

  // -----------------------????????????------------------------

  // ?????????????????????
  initApply() {
    const today = new Date();
    this.tableform.get('end').setValue(today);
    const now = new Date();
    const date = new Date(now.setMonth((new Date().getMonth() - 1)));

    this.tableform.get('start').setValue(date);
    this.tableform.get('movieName').setValue('');
    this.tableform.get('status').setValue('');
    this.tableform.get('hall').setValue('');
    this.appendPage = {
      applyDatas: [],
      loading: false,
      total: 0, // ??????
      pageSize: 8,
      pageIndex: 1 // ????????????
    };
  }

  // ??????
  queryApply() {
    const end = this.datePipe.transform(this.tableform.get('end').value, 'yyyy-MM-dd') + ' 23:59:59';
    const start = this.datePipe.transform(this.tableform.get('start').value, 'yyyy-MM-dd') + ' 00:00:00';
    const params = {
      terminalCode: this.authSvc.currentTerminalCode,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidComp: this.appSvc.currentCinema.uidComp,
      hallCode: this.tableform.get('hall').value,
      movieName: this.tableform.get('movieName').value,
      showTimeEnd: end,
      showTimeStart: start,
      approveStatus: this.tableform.get('status').value,
      page: {
        currentPage: this.appendPage.pageIndex,
        pageSize: this.appendPage.pageSize
      }
    };

    this.appendPage = {
      applyDatas: [],
      loading: false,
      total: 0, // ??????
      pageSize: 8,
      pageIndex: 1 // ????????????
    };
    this.appendPage.loading = true;
    this.supplementSvc.getAppendApplyList(params).subscribe(res => {
      this.appendPage.loading = false;
      if (res.status.status === 0) {
        res.data.detail.forEach(value => {
          if (value.approveStatus === 0) {
            value.approveStatusName = '?????????';
          } else if (value.approveStatus === 1) {
            value.approveStatusName = '?????????';
          } else if (value.approveStatus === 2) {
            value.approveStatusName = '????????????';
          } else if (value.approveStatus === 3) {
            value.approveStatusName = '????????????';
          }
        });
        this.appendPage.pageIndex = res.data.page.currentPage;
        this.appendPage.total = res.data.page.totalSize;
        this.appendPage.applyDatas = res.data.detail;
      }
    });
  }

  // ??????
  view(p) {
    const params = {
      uidAppendApply: p.uid
    };
    console.log(params);
    this.viewModal(params);
  }

  // ??????????????????
  async viewModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ViewComponent,
      componentProps: {params},
      cssClass: 'supplement-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // ????????????????????????
    if (data) {

    }
  }

  changePageSize(pageSize) {
    this.appendPage.pageSize = pageSize;
    this.queryApply();
  }

  changePageIndex(pageIndex) {
    this.appendPage.pageIndex = pageIndex;
    this.queryApply();
  }

  // ??????
  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }
}
