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
    size: 8,             // 每页数据条数
    showPage: 1,
    curPage: 0,             // 页码数
    isLastPage: false,             // 是否首页
    isFirstPage: false,            // 是否尾页
    totalPageSize: 0,       // 总页数
    totalCount: 0,       // 总数据条数
    showData: [],  // 当前页应该显示的数据
    showDataCount: 0  // 当前页有几条数据
  };

  appendPage = {
    applyDatas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };

  addPage = {
    applyDatas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 6,
    pageIndex: 1 // 当前页数
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

  // 初始化日期信息
  initPlanDate() {
    const today = this.form.get('date').value;
    const datestr = this.datePipe.transform(today, 'yyyy-MM-dd');
    const week = this.weekDate.transform(today);
    const name = datestr + '       ' + week;
    const label = this.dateUtils.getTodayTomorrowName(today);
    this.planDate.name = name;
    this.planDate.label = label;
  }

  // 前天
  prev() {
    const date = new Date(this.form.get('date').value);
    const preDate = this.dateUtils.addDay(date, -1);
    this.form.get('date').setValue(preDate);
  }

  // 后天
  next() {
    const date = new Date(this.form.get('date').value);
    const nextDate = this.dateUtils.addDay(date, 1);
    this.form.get('date').setValue(nextDate);
  }

  // 切换
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

  // 初始化影厅
  initDatas() {
    if (this.hallUid) {
      this.initPlans();
    } else {
      console.log('初始化影厅');
      const params = {
        uidComp: this.appSvc.currentCinema.uidComp
      };
      this.toastSvc.loading('正在处理...', 20000);
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

  // 上页
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

  // 下页
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
    console.log('初始化排期');
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
      size: 8,             // 每页数据条数
      showPage: 1,
      curPage: 0,             // 页码数
      isLastPage: false,             // 是否首页
      isFirstPage: false,            // 是否尾页
      totalPageSize: 0,       // 总页数
      totalCount: 0,       // 总数据条数
      showData: [],  // 当前页应该显示的数据
      showDataCount: 0  // 当前页有几条数据
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
    this.toastSvc.loading('正在处理...', 20000);
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
        res.data.seatTotalNum += ' (总座位数：' + res.data.totalSeatNum + ',其中已售：' + res.data.saleSeatNum + ',坏座：' + res.data.badSeatNum + ')';
        res.data.posMovieNameHall = res.data.posMovieName + '(' + res.data.planMoviePublish + '/' + res.data.posMovieLan + ')';
        res.data.newTime = res.data.posStartTime + ' 至 ' + res.data.posEndTime;
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
      total: 0, // 总数
      pageSize: 6,
      pageIndex: 1 // 当前页数
    };
    this.addPage.loading = true;
    this.supplementSvc.getPlanAppendDetailList(params).subscribe(res => {
      this.addPage.loading = false;
      if (res.status.status === 0) {
        res.data.forEach(item => {
          if (item.status === 0) {
            item.statusName = '未提交';
            if (!this.canCommit) {
              this.canCommit = true;
            }
          } else if (item.status === 1) {
            item.statusName = '待审核';
          } else if (item.status === 2) {
            item.statusName = '已生效';
          }

          if (item.isOverTime === 0) {
            item.isOverTimeName = '时限内';
          } else if (item.isOverTime === -1) {
            item.isOverTimeName = '时限外';
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

  // 选择影厅
  changeHall(e) {
    this.hallUid = e;
    this.initPlans();
  }

  // 选中影片
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
      size: 8,             // 每页数据条数
      showPage: 1,
      curPage: 0,             // 页码数
      isLastPage: false,             // 是否首页
      isFirstPage: false,            // 是否尾页
      totalPageSize: 0,       // 总页数
      totalCount: 0,       // 总数据条数
      showData: [],  // 当前页应该显示的数据
      showDataCount: 0  // 当前页有几条数据
    };
    this.form.get('date').setValue(new Date());
  }

  // 添加
  append() {
    const ticketPrice = this.appendform.get('ticketPrice').value;
    const ticketNum = this.appendform.get('ticketNum').value;
    const uidPayMode = this.appendform.get('uidPayMode').value;
    if (!this.appendform.valid) {
      if (ticketPrice === '') {
        this.message.warning('请输入票价');
      } else if (ticketNum === '') {
        this.message.warning('请输入数量');
      } else if (uidPayMode === '') {
        this.message.warning('请选择支付方式');
      }
      return;
    }
    // 判断数字
    const reg = /^([1-9][0-9]*)$/;
    if (!reg.test(ticketNum)) {
      this.message.warning('数量只允许输入数字');
      return;
    }
    const reg2 = /^[0-9]+(.[0-9]{1,2})?$/;
    if (!reg2.test(ticketPrice)) {
      this.message.warning('票价金额不正确,只允许最多2位小数');
      return;
    }
    // 判断价格
    if (ticketPrice < this.plan.planLimitPrice) {
      this.message.warning('输入的票价不能低于当前影片最低价：' + this.plan.planLimitPrice);
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
    this.toastSvc.loading('正在处理...', 1000);
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

  // 删除
  delete(item) {
    if (!item.uid) {
      return;
    }
    this.nzmodal.confirm({
      nzTitle: '确定要删除？',
      nzContent: '',
      nzOkText: '确定',
      nzOkType: 'primary',
      // nzOkDanger: true,
      nzOnOk: () => {
        const params = {
          uid: item.uid
        };
        this.toastSvc.loading('正在处理...', 1000);
        this.supplementSvc.delAppend(params).subscribe(res => {
          this.toastSvc.hide();
          if (res.status.status === 0) {
            this.message.success('删除成功', {nzDuration: 2000});
            this.initPlanInfo();
          } else {
            this.message.error('删除失败', {nzDuration: 2000});
          }
        });
      },
      nzCancelText: '取消',
      nzOnCancel: () => {

      }
    });
  }

  // 提交补登
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
    this.toastSvc.loading('正在处理...', 30000);
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

  // -----------------------补登申请------------------------

  // 初始化补登申请
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
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
  }

  // 查询
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
      total: 0, // 总数
      pageSize: 8,
      pageIndex: 1 // 当前页数
    };
    this.appendPage.loading = true;
    this.supplementSvc.getAppendApplyList(params).subscribe(res => {
      this.appendPage.loading = false;
      if (res.status.status === 0) {
        res.data.detail.forEach(value => {
          if (value.approveStatus === 0) {
            value.approveStatusName = '未接收';
          } else if (value.approveStatus === 1) {
            value.approveStatusName = '已接收';
          } else if (value.approveStatus === 2) {
            value.approveStatusName = '受理成功';
          } else if (value.approveStatus === 3) {
            value.approveStatusName = '受理失败';
          }
        });
        this.appendPage.pageIndex = res.data.page.currentPage;
        this.appendPage.total = res.data.page.totalSize;
        this.appendPage.applyDatas = res.data.detail;
      }
    });
  }

  // 查看
  view(p) {
    const params = {
      uidAppendApply: p.uid
    };
    console.log(params);
    this.viewModal(params);
  }

  // 显示明细界面
  async viewModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ViewComponent,
      componentProps: {params},
      cssClass: 'supplement-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
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

  // 关闭
  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }
}
