import {OnInit, NgZone, Component, ViewChild, ElementRef} from '@angular/core';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {SupplementService} from '../../supplement/supplement.service';
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
import {RefundViewComponent} from '../../refund/components/view/view';
import {RefundService} from '../refund.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-refund-index',
  templateUrl: './index.page.html',
  styleUrls: ['../../supplement/index/index.page.scss', './index.page.scss'],
  providers: [DatePipe, WeekPipe, NzMessageService]
})
export class RefundIndexPage implements OnInit {

  refundform: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required])
  });

  form: FormGroup = new FormGroup({
    date: new FormControl('', [Validators.required])
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
  initFlag = false;
  hallDatas;
  hallUid;
  planDatas;
  plan;
  planDetail = null;
  payDatas;
  planDate = {
    label: '',
    name: ''
  };
  totalPrice = 0;
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

  hideEmptyPlan = true;
  hideEmptyMovie = true;
  canReturn = false;
  billDetail;
  payList;
  refundList;
  ticketList;
  goodsList;
  refundDetail = {
    reason: '',
    money: '0.00',
    num: 0,
    customPay: false
  };
  reasonList = [
    {label: '????????????', value: 'rejectReasonBad'},
    {label: '????????????', value: 'rejectReasonError'},
    {label: '????????????', value: 'rejectReasonQuality'},
    {label: '????????????', value: 'rejectReasonOther'}
  ];
  customIndex = 0;
  customPays = [];
  @ViewChild('autoFocusInput', {static: false}) private autoFocusInput: ElementRef;

  refundAllDetail = {
    rejectReasonCode: '',
    uidPayMode: '0'
  };

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private appSvc: AppService,
              public authSvc: AuthService,
              private dialogSvc: DialogService,
              private router: Router,
              private route: ActivatedRoute,
              private supplementSvc: SupplementService,
              private refundSvc: RefundService,
              private toastSvc: ToastService,
              private shoppingCartSvc: ShoppingCartService,
              private voucherPrinter: VoucherPrinter,
              private publicUtils: PublicUtils,
              private datePipe: DatePipe,
              private weekDate: WeekPipe,
              private dateUtils: DateUtils,
              private pagination: Pagination,
              private message: NzMessageService) {

  }

  ngOnInit() {
    if (this.authSvc.role('780')){
      let flag = false;
      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.billCode) {
        this.refundform.get('search').setValue(this.route.snapshot.queryParams.billCode);
        flag = true;
        this.query();
      }
      if (!flag) {
        setTimeout(() => {
          this.autoFocusInput.nativeElement.focus();
        }, 500);
      }
    }else if (this.authSvc.role('781')){
      this.changeTab(1);
    }else if (this.authSvc.role('782')){
      this.changeTab(2);
    }
  }

  // ----------------------------------------??????----------------------------------------------

  // ????????????
  keyPress(event) {

  }

  // ??????
  clear() {
    this.billDetail = null;
    this.payList = null;
    this.refundList = null;
    this.ticketList = null;
    this.goodsList = null;
    this.refundDetail = {
      reason: 'rejectReasonBad',
      money: '0.00',
      num: 0,
      customPay: false
    };
    this.customIndex = 0;
    this.customPays = [];
    this.canReturn = false;
    this.refundform.get('search').setValue('');
    setTimeout(() => {
      this.autoFocusInput.nativeElement.focus();
    }, 500);
  }

  // ??????
  query() {
    if (!this.refundform.get('search').value) {
      this.message.warning('??????????????????????????????????????????????????????');
      return;
    }
    const params = {
      search: this.refundform.get('search').value,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.billDetail = null;
    this.payList = null;
    this.refundList = null;
    this.ticketList = null;
    this.goodsList = null;
    this.refundDetail = {
      reason: 'rejectReasonBad',
      money: '0.00',
      num: 0,
      customPay: false
    };
    this.customIndex = 0;
    this.customPays = [];
    this.canReturn = false;
    this.toastSvc.loading('????????????...', 30000);
    this.refundSvc.getPosBill(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (!res.data) {
          this.message.info('????????????????????????');
          return;
        }
        let createTimeLabel = '';
        if (res.data.createTime != null) {
          const arr = res.data.createTime.split(':');
          createTimeLabel = arr[0] + ':' + arr[1];
        }
        res.data.createTimeLabel = createTimeLabel;

        let hallName = res.data.hallName;
        let hallType = res.data.hallType;
        let str = '';
        if (hallName == null) {
          hallName = '';
        }
        if (hallType == null) {
          hallType = '';
        }
        if (hallType === '') {
          str = hallName;
        } else {
          str = hallName + '(' + hallType + ')';
        }
        res.data.hallNameLabel = str;

        let cartMovieName = res.data.cartMovieName;
        let cartMovieLanguage = res.data.cartMovieLanguage;
        let cartMoviePublish = res.data.cartMoviePublish;
        let movieNameLabel = '';
        if (cartMovieName == null) {
          cartMovieName = '';
        }
        if (cartMovieLanguage == null) {
          cartMovieLanguage = '';
        }
        if (cartMoviePublish == null) {
          cartMoviePublish = '';
        }
        if (cartMovieLanguage === '' && cartMoviePublish === '') {
          movieNameLabel = cartMovieName;
        } else {
          movieNameLabel = cartMovieName + '(' + cartMovieLanguage + '/' + cartMoviePublish + ')';
        }
        res.data.movieNameLabel = movieNameLabel;

        this.billDetail = res.data;
        const pdatas = [];
        const rdatas = [];
        res.data.posBillPayDTOList.forEach(item => {
          if (item.payModeCode === 'MemberPoints') {
            item.payModeNameLabel = item.payModeName + '(???)';
          } else {
            item.payModeNameLabel = item.payModeName + '(???)';
          }
          if (item.isRefund === 0) {
            pdatas.push(item);
          } else {
            rdatas.push(item);
          }
        });
        this.payList = pdatas;
        this.refundList = rdatas;

        res.data.posBillSeatDetailDTOList.forEach(item => {
          item.isChecked = false;
          if (item.seatRow == null && item.resCode != null) {
            const arrs = item.resCode.split('_##');
            if (arrs.length > 2) {
              item.seatRow = arrs[1];
              item.seatCol = arrs[2];
            }
          }
          item.seatLabel = item.seatRow + '???' + item.seatCol + '???';
          if (item.isRefund === 1) {
            item.refundLabel = '??????';
          } else {
            item.refundLabel = '??????';
          }
        });
        this.ticketList = res.data.posBillSeatDetailDTOList;
        if (this.ticketList && this.ticketList.length > 0) {
          this.ticketList.forEach(item => {
            if (item.isRefund === 0) {
              if (!this.canReturn) {
                this.canReturn = true;
              }
            }
          });
        }
        const goods = this.getSellListData(res.data.posBillResDetailDTOList);
        if (goods && goods.length > 0) {
          goods.forEach(item => {
            item.isChecked = false;
            if (item.isRefund === 0) {
              if (!this.canReturn) {
                this.canReturn = true;
              }
            }
          });
          this.goodsList = goods;
        }
      }
    });
  }

  getDeletData(list, id, sum) {
    const listA = [];  // ???????????????id
    const listB = [];  // id??????
    const listAB = []; // ????????????id?????????

    list.forEach(it => {
      listA.push(it[id]);
    });

    listA.forEach(item => {
      if (listB.indexOf(item) === -1) {
        listB.push(item);
      }
    });

    listB.forEach(itemId => {
      let sumIndex = 0;
      let sameItem = {
        priceAll: 0,
        billResCompbPriceOri: 0,
        pSum: 0,
        billResComboPrice: 0
      };
      const allPrice = 0;
      let index = 0;
      list.forEach(it => {
        if (it[id] === itemId) {
          if (sumIndex === 0) {
            sameItem = it;
          }
          sumIndex++;
        }
        if (index === (list.length - 1)) {
          sameItem[sum] = sumIndex;
          sameItem.priceAll = allPrice;
          listAB.push(sameItem);
        }
        index++;
      });
    });

    return [listA, listB, listAB];
  }

  getSellListData(list) {
    const ArrAll = [];
    list.forEach(item => {
      const itemA = {
        uid: item.uid,
        uidRes: item.uidRes,
        billResPrice: item.billResPrice,
        isCombo: item.isCombo,
        isRefund: item.isRefund,
        resName: item.resName,
        nameResStr: ''
      };
      if (item.isCombo === 0) {
        const CartResContainList = this.getDeletData(item.contailDTOList, 'uidRes', 'sSum');
        const list2 = CartResContainList[2];
        let nameResStr = '(';
        const arrs = [];
        list2.forEach(subitem => {
          arrs.push(nameResStr + subitem.resName + '*' + subitem.sSum);
        });
        nameResStr += arrs.join('???');
        nameResStr += ')';
        itemA.nameResStr = nameResStr;
        ArrAll.push(itemA);
      } else {
        itemA.nameResStr = '';
        ArrAll.push(itemA);
      }
    });
    return ArrAll;
  }

  // ??????
  selectAll(e) {
    if (this.ticketList && this.ticketList.length > 0) {
      this.ticketList.forEach(item => {
        if (item.isRefund === 0) {
          item.isChecked = e.checked;
        }
      });
    }
    if (this.goodsList && this.goodsList.length > 0) {
      this.goodsList.forEach(item => {
        if (item.isRefund === 0) {
          item.isChecked = e.checked;
        }
      });
    }
    this.calculateAll();
  }

  // ??????
  select(item, e) {
    item.isChecked = e.checked;
    this.calculateAll();
  }

  // ?????????????????????
  calculateAll() {
    let money = 0;
    let num = 0;
    if (this.ticketList && this.ticketList.length > 0) {
      const tickets = this.getRefundTicketDTOList(this.ticketList, false);
      if (tickets.length > 0) {
        tickets.forEach(item => {
          money = money + item.billResPrice + item.billResServiceNet;
        });
      }
      num = tickets.length;
    }
    if (this.goodsList && this.goodsList.length > 0) {
      const goods = this.getRefundTicketDTOList(this.goodsList, false);
      if (goods.length > 0) {
        goods.forEach(item => {
          money = money + item.billResPrice;
        });
      }
    }
    this.refundDetail.num = num;
    this.refundDetail.money = money.toFixed(2);
  }

  getRefundTicketDTOList(list, force) {
    const selectList = [];
    list.forEach(item => {
      if ((item.isChecked && item.isRefund === 0) || force) {
        const data = {
          uid: item.uid,
          billResPrice: 0,
          billResServiceNet: item.billResServiceNet,
          isRefund: item.isRefund,
          isCombo: 0
        };
        if (item.ticketPrice !== undefined) {
          data.billResPrice = item.ticketPrice;
        } else {
          data.billResPrice = item.billResPrice;
        }
        if (item.isCombo === undefined) {
          data.isCombo = 1;
        } else {
          data.isCombo = item.isCombo;
        }
        selectList.push(data);
      }
    });
    return selectList;
  }

  // ???????????????????????????
  selectCustomPay(e) {
    this.refundDetail.customPay = e.checked;
    this.customIndex += 1;
    if (e.checked) {
      this.customPays = [
        {id: this.customIndex, uidPayMode: '', billPayAmount: 0, account: '', payModeCode: ''}
      ];
    } else {
      this.customPays = [];
    }
  }

  // ??????
  addCustomPay() {
    if (this.customPays.length === 1) {
      this.customIndex += 1;
      this.customPays.push({id: this.customIndex, uidPayMode: '', billPayAmount: 0, account: '', payModeCode: ''});
    }
  }

  // ??????
  delCustomPay(rp) {
    const arr = [];
    this.customPays.forEach(item => {
      if (item.id !== rp.id) {
        arr.push(item);
      }
    });
    this.customPays = arr;
  }

  // ??????????????????
  changeCustomPay(rp, e) {
    this.billDetail.selfRefundPayTypeList.forEach(item => {
      if (item.uid === rp.uidPayMode) {
        rp.payModeCode = item.modeCode;
      }
    });
  }

  // ??????
  refundTicket() {
    let reasonDesc = '';
    this.reasonList.forEach(item => {
      if (this.refundDetail.reason === item.value) {
        reasonDesc = item.label;
      }
    });
    let refundTicketDTOList = [];
    if (this.ticketList && this.ticketList.length > 0) {
      const tickets = this.getRefundTicketDTOList(this.ticketList, false);
      if (tickets.length > 0) {
        refundTicketDTOList = refundTicketDTOList.concat(tickets);
      }
    }
    if (this.goodsList && this.goodsList.length > 0) {
      const goods = this.getRefundTicketDTOList(this.goodsList, false);
      if (goods.length > 0) {
        refundTicketDTOList = refundTicketDTOList.concat(goods);
      }
    }

    if (refundTicketDTOList.length === 0) {
      this.message.warning('????????????????????????');
      return;
    }

    // ???????????????????????????
    if (this.refundDetail.customPay) {
      let flag = false;
      let money = 0;
      this.customPays.forEach(item => {
        if (item.uidPayMode === '') {
          flag = true;
        }
        money += item.billPayAmount;
      });
      if (flag) {
        this.message.warning('?????????????????????');
        return;
      }
      if (money < 0) {
        this.message.warning('????????????????????????0');
        return;
      }
    }

    if (this.refundDetail.reason === '') {
      this.message.warning('?????????????????????');
      return;
    }

    if (this.clickFlag){
      return;
    }
    this.clickFlag = true;
    setTimeout(() => {
      this.clickFlag = false;
    }, 2000);

    const params = {
      teminalCode: this.authSvc.currentTerminalCode,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      isReturnServiceNet: 0,
      rejectReasonCode: this.refundDetail.reason,
      rejectReasonDesc: reasonDesc,
      uidBill: this.billDetail.uidBill,
      refundTicketDTOList,
      refundDeatilDTOList: this.customPays,
      refundGoodsList: refundTicketDTOList,
      refundPaymentList: this.customPays,
      selfRefundPayment: this.refundDetail.customPay ? 1 : 0,
      notErrorInterceptor: true
    };
    this.toastSvc.loading('????????????...', 30000);
    this.refundSvc.refundBill(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data.payStatus === 1) {
          const paramDatas = {
            typeCodeList: ['T00209'],
            uidBill: res.data.uidPosBill,
            uidComp: this.appSvc.currentCinema.uidComp
          };
          this.message.success(res.data.payMessage, {nzDuration: 2000});
          setTimeout(() => {
            // res.data ??????????????????????????????
            const methodName = '/printTempletService-api/templetPrint/printTemp';
            this.voucherPrinter.print(paramDatas, methodName, (ress) => {
              if (ress.status === '0') {
                this.message.success(ress.msg, {nzDuration: 2000});
              } else {
                this.message.error(ress.msg, {nzDuration: 2000});
              }
            });
            this.query();
          }, 800);
        } else {
          this.message.error(res.data.payMessage);
        }
      }else{
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // --------------------------------------????????????------------------------------------------

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
      this.refundform.get('search').setValue('');
      this.billDetail = null;
      setTimeout(() => {
        this.autoFocusInput.nativeElement.focus();
      }, 500);
    } else if (this.index === 1) {
      this.init();
    } else {
      this.initApply();
    }
  }

  // ???????????????
  initDatas() {
    if (this.hallDatas && this.hallDatas.length > 0) {
      this.initPlans();
    } else {
      const params = {
        uidComp: this.appSvc.currentCinema.uidComp
      };
      this.supplementSvc.getFieldByUidList(params).subscribe(res => {
        if (res.status.status === 0) {
          if (res.data && res.data.length > 0) {
            let datas = [
              {uid: '', fieldName: '??????'}
            ];
            datas = datas.concat(res.data);
            this.hallDatas = datas;
            this.hallUid = datas[0].uid;
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
    const today = this.form.get('date').value;
    const datestr = this.datePipe.transform(today, 'yyyy-MM-dd');
    const params = {
      showType: 'tuxing',
      uidComp: this.appSvc.currentCinema.uidComp,
      planApproveStatus: 2,
      uidField: this.hallUid,
      date: datestr,
      movieName: ''
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
    this.planDetail = null;
    this.hideEmptyPlan = true;
    this.hideEmptyMovie = true;
    this.refundAllDetail = {
      rejectReasonCode: '',
      uidPayMode: '0'
    };
    this.toastSvc.loading('????????????...', 500);
    this.refundSvc.getRefundPlan(params).subscribe(res => {
      if (res.status.status === 0) {
        if (res.data.planList && res.data.planList.length > 0) {
          res.data.planList.forEach(item => {
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
          this.planDatas = res.data.planList;
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
    this.totalPrice = 0;
    this.planDetail = null;
    this.refundAllDetail = {
      rejectReasonCode: '',
      uidPayMode: '0'
    };
    this.hideEmptyMovie = true;
    this.refundSvc.getRefundBillInfo(params).subscribe(res => {
      if (res.status.status === 0) {
        res.data.posMovieNameHall = res.data.posMovieName + '(' + res.data.planMoviePublish + '/' + res.data.posMovieLan + ')';
        res.data.showMovieName = res.data.posMovieNameHall + ' /' + res.data.posStartTime + '/' + res.data.hallName;
        this.planDetail = res.data;
        this.initRefundList(res.data);
      } else {
        this.hideEmptyMovie = false;
      }
    });
    this.initPayInfo();
  }

  initPayInfo() {
    if (this.payDatas) {
      return;
    }
    const params = {
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.payDatas = null;
    this.refundSvc.getAllRefundPosPayModeList(params).subscribe(res => {
      if (res.status.status === 0) {
        if (res.data && res.data.length > 0) {
          let datas = [{
            uid: '0',
            modeCode: 'Original',
            uidOrg: '',
            uidComp: null,
            modeName: '????????????'
          }];
          datas = datas.concat(res.data);
          this.payDatas = datas;
        }
      }
    });
  }

  initRefundList(data) {
    this.addPage = {
      applyDatas: [],
      loading: false,
      total: 0, // ??????
      pageSize: 6,
      pageIndex: 1 // ????????????
    };
    const datas = [];
    datas.push(data);
    this.addPage.applyDatas = datas;
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
    if (this.hallDatas && this.hallDatas.length > 0) {
      this.hallUid = this.hallDatas[0].uid;
    }
    if (!this.initFlag){
      this.initFlag = true;
      this.form.get('date').valueChanges.subscribe(res => {
        this.initPlanDate();
        this.initDatas();
      });
    }
    this.form.get('date').setValue(new Date());
  }

  // ????????????
  refundAll() {
    if (this.refundAllDetail.uidPayMode === '') {
      this.message.warning('?????????????????????');
      return;
    }
    let payModeCode = '';
    this.payDatas.forEach(item => {
      if (item.uid === this.refundAllDetail.uidPayMode) {
        payModeCode = item.modeCode;
      }
    });
    if (this.refundAllDetail.rejectReasonCode === '') {
      this.message.warning('?????????????????????');
      return;
    }
    let rejectReasonDesc = '';
    this.reasonList.forEach(item => {
      if (item.value === this.refundAllDetail.rejectReasonCode) {
        rejectReasonDesc = item.label;
      }
    });
    const params = {
      terminalCode: this.authSvc.currentTerminalCode,
      billPayAmount: this.planDetail.refundPrice,
      isReturnServiceNet: 0,
      rejectReasonCode: this.refundAllDetail.rejectReasonCode,
      rejectReasonDesc,
      payModeCode,
      uidPayMode: this.refundAllDetail.uidPayMode,
      uidPlan: this.plan.uid
    };
    console.log(params);
    this.toastSvc.loading('????????????...', 30000);
    this.refundSvc.saveRefundBillTicketNew(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.message.success(res.status.msg2Client, {nzDuration: 2000});
        this.initPlans();
      }
    });
  }

  // -----------------------????????????------------------------

  // ?????????????????????
  initApply() {
    this.tableform.get('movieName').setValue('');
    this.tableform.get('status').setValue('');
    this.tableform.get('hall').setValue('');
    const today = new Date();
    this.tableform.get('end').setValue(today);
    const now = new Date();
    const date = new Date(now.setMonth((new Date().getMonth() - 1)));
    this.tableform.get('start').setValue(date);
    this.appendPage = {
      applyDatas: [],
      loading: false,
      total: 0, // ??????
      pageSize: 8,
      pageIndex: 1 // ????????????
    };
    if (this.hallDatas && this.hallDatas.length > 0) {
      this.queryApply();
    } else {
      const params = {
        uidComp: this.appSvc.currentCinema.uidComp
      };
      this.supplementSvc.getFieldByUidList(params).subscribe(res => {
        if (res.status.status === 0) {
          if (res.data && res.data.length > 0) {
            let datas = [
              {uid: '', fieldName: '??????'}
            ];
            datas = datas.concat(res.data);
            this.hallDatas = datas;
            this.queryApply();
          }
        }
      });
    }
  }


  // ??????
  queryApply() {
    const end = this.datePipe.transform(this.tableform.get('end').value, 'yyyy-MM-dd');
    const start = this.datePipe.transform(this.tableform.get('start').value, 'yyyy-MM-dd');
    const params = {
      uidComp: this.appSvc.currentCinema.uidComp,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidField: this.tableform.get('hall').value,
      planMovieName: this.tableform.get('movieName').value,
      maxShowDate: end,
      minShowDate: start,
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
    this.refundSvc.getApplyForRefund(params).subscribe(res => {
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
      uidPosBill: p.uidPosBill
    };
    console.log(params);
    this.viewModal(params);
  }

  // ??????????????????
  async viewModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: RefundViewComponent,
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
