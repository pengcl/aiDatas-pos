import {AfterViewInit, Component, NgZone, ElementRef, ViewChild} from '@angular/core';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {TicketService} from '../../ticket/ticket.service';
import {GetTicketService} from '../getticket.service';
import {DialogService} from '../../../@theme/modules/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {ToastService} from '../../../@theme/modules/toast';
import {AuthService} from '../../auth/auth.service';
import {AlertmsgComponent} from '../../auth/components/alertmsg/alertmsg';
import {getBookDatas} from '../getticket.utils';
import {DelayedComponent} from '../../../@theme/entryComponents/delayed/delayed';
import {ShoppingCartService} from '../../shopping-cart/shopping-cart.service';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';
import {PublicUtils} from '../../../@core/utils/public-utils';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {DatePipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {timeout} from 'rxjs/operators';
import {CheckAuth} from '../../../@core/utils/check-auth';

@Component({
  selector: 'app-getticket-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService, NzModalService, DatePipe]
})
export class GetTicketIndexPage implements AfterViewInit {

  form: FormGroup = new FormGroup({
    billTakeCode: new FormControl('', [Validators.required])
  });
  bookform: FormGroup = new FormGroup({
    ticketWithdrawal: new FormControl('', [Validators.required])
  });
  blockform: FormGroup = new FormGroup({
    orderId: new FormControl('', [Validators.required])
  });
  index = 0;
  timerId;
  detail;
  rowData;
  authparams = {
    authFuctionCode: 'operRePrint',
    authFuctionName: '',
    authFuctionType: '1',
    uidAuthFuction: '',
    cinemaCode: '',
    accountLoginName: '',
    accountLoginPassword: '',
    orgAlias: ''
  };
  printparams = {
    title: '打印影票',
    content: '正在打印电影票，请稍后...'
  };
  bookDatas;
  bookItem;
  clickFlag = false;
  blockDetail;
  ticketPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 7,
    pageIndex: 1 // 当前页数
  };

  blockPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 7,
    pageIndex: 1 // 当前页数
  };
  showNum = false;

  @ViewChild('billTakeCode', {static: false}) private billTakeCode: ElementRef;
  @ViewChild('ticketWithdrawal', {static: false}) private ticketWithdrawal: ElementRef;
  @ViewChild('orderId', {static: false}) private orderId: ElementRef;

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private datePipe: DatePipe,
              private dialogSvc: DialogService,
              private appSvc: AppService,
              public authSvc: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private ticketSvc: TicketService,
              private getticketSvc: GetTicketService,
              private toastSvc: ToastService,
              private shoppingCartSvc: ShoppingCartService,
              private voucherPrinter: VoucherPrinter,
              private publicUtils: PublicUtils,
              private message: NzMessageService,
              private http: HttpClient,
              private nzmodal: NzModalService,
              private checkAuth: CheckAuth) {

  }

  ngAfterViewInit() {
    if (this.authSvc.role('750')) {
      if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.billTakeCode) {
        const code = this.route.snapshot.queryParams.billTakeCode;
        this.form.get('billTakeCode').setValue(code);
        this.changeKeyupNumber('billTakeCode');
        this.query();
        return;
      }
      this.detail = null;
      this.index = 0;
      setTimeout(() => {
        this.billTakeCode.nativeElement.focus();
        this.showNum = true;
      }, 500);
    } else if (this.authSvc.role('751')) {
      this.changeTab(1);
    }
  }

  focusInput() {
    this.showNum = true;
  }

  hideNum() {
    this.showNum = false;
  }

  clickNumber(strNum: string) {
    let code = '';
    if (this.index === 0) {
      code = this.form.get('billTakeCode').value;
    } else if (this.index === 1) {
      code = this.bookform.get('ticketWithdrawal').value;
    } else {
      code = this.blockform.get('orderId').value;
    }
    if (strNum === 'del') {
      code = code.slice(0, code.length - 1);
    } else {
      if (this.index === 0 && code.length >= 17) {
        return;
      }
      code = code + strNum;
    }
    if (this.index === 0) {
      this.form.get('billTakeCode').setValue(code);
      this.changeKeyupNumber('billTakeCode');
    } else if (this.index === 1) {
      this.bookform.get('ticketWithdrawal').setValue(code);
    } else {
      this.blockform.get('orderId').setValue(code);
    }
  }

  changeKeyupNumber(target) {
    let e = '';
    if (this.index === 0) {
      e = this.form.get(target).value;
      const sb = e.replace(/[^\d]/g, '');
      this.form.get(target).setValue(sb);
    }
  }

  // 切换
  changeTab(index) {
    if (index === this.index) {
      return;
    }
    //this.toastSvc.loading('', 500);
    this.index = index;
    this.init();
    setTimeout(() => {
      if (this.index === 0) {
        this.billTakeCode.nativeElement.focus();
      } else if (this.index === 1) {
        this.ticketWithdrawal.nativeElement.focus();
      } else {
        this.orderId.nativeElement.focus();
      }
      this.showNum = true;
    }, 500);
  }

  init() {
    this.detail = null;
    this.rowData = null;
    this.ticketPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
    this.authparams = {
      authFuctionCode: 'operRePrint',
      authFuctionName: '',
      authFuctionType: '1',
      uidAuthFuction: '',
      cinemaCode: '',
      accountLoginName: '',
      accountLoginPassword: '',
      orgAlias: ''
    };
    this.form.get('billTakeCode').setValue('');

    this.bookform.get('ticketWithdrawal').setValue('');
    this.bookDatas = null;
    this.bookItem = null;
    this.blockform.get('orderId').setValue('');
    this.blockDetail = null;
    this.blockPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
  }

  // ---------------------------------网售取票-------------------------------------
  // 清除
  clearTake() {
    this.form.get('billTakeCode').setValue('');
    this.detail = null;
    this.ticketPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
    setTimeout(() => {
      this.billTakeCode.nativeElement.focus();
      this.showNum = true;
    }, 500);
  }

  // 回车事件
  pressTake(event) {
    if (event && event.keyCode === 13) {
      this.query();
    }
  }

  // 查询网售取票
  query() {
    if (this.form.invalid) {
      this.message.warning('请输入取票码及验证码');
      return;
    }
    let billTakeCode = this.form.get('billTakeCode').value;
    billTakeCode = billTakeCode.replace(/[^\d]/g, '');
    if (billTakeCode.length !== 12 && billTakeCode.length !== 15) {
      this.message.warning('请输入正确的取票码及验证码');
      return;
    }
    let takeCode = '';
    let verifyCode = '';
    if (billTakeCode.length === 12) {
      takeCode = billTakeCode.substring(0, 6);
      verifyCode = billTakeCode.substring(6, 12);
    } else {
      takeCode = billTakeCode.substring(0, 9);
      verifyCode = billTakeCode.substring(9, 15);
    }
    const prams = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      billTakeCode: takeCode,
      billVerifyCode: verifyCode
    };
    this.detail = null;
    this.ticketPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
    this.toastSvc.loading('正在处理...', 20000);
    this.getticketSvc.getBillTicketList(prams).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data && res.data != null) {
          this.showNum = false;
          if (res.data.orderStatus === 0 && res.data.isCompleteTake === 0) {
            this.detail = res.data;
            const datas = res.data.ticketList;
            datas.forEach(item => {
              item.status = item.takeStatus === 0 ? '未打印' : '已打印';
            });
            this.ticketPage.total = datas.length;
            this.ticketPage.datas = datas;
          } else if (res.data.orderStatus === 1 || res.data.orderStatus === 2) {
            this.message.info('取票码错误或者订单未完成');
            this.showNum = true;
          } else if (res.data.isCompleteTake === 1) {
            if (res.data.isHasMer === 1) {
              const pars = {billTakeCode};
              this.nzmodal.confirm({
                nzTitle: '电影票已取，但订单还有卖品未取',
                nzContent: '',
                nzOkText: '去取货',
                nzOkType: 'primary',
                // nzOkDanger: true,
                nzOnOk: () => {
                  this.zone.run(() => {
                    this.router.navigate(['/pickup/index'], {queryParams: pars}).then();
                  });
                },
                nzCancelText: '关闭',
                nzOnCancel: () => {
                }
              });
            } else if (res.data.isHasMer === 0) {
              this.message.info('没有可取的电影票');
            }
          }
        } else {
          this.message.info('没有可取的电影票');
        }
      }
    });
  }

  // 重打印
  reprint(data) {
    this.rowData = data;
    this.authparams.uidAuthFuction = data.uid;
    this.checkAuth.auth(this.authparams, null, (type, datas) => {
      if (type === 1) {
        this.alertmsgModal(this.printparams);
      } else {
        // 直接打印，不弹提示页面
        this.print();
      }
    });

  }

  // 显示打印提示界面
  async alertmsgModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: AlertmsgComponent,
      componentProps: {params},
      cssClass: 'alert-msg-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.print();
    }
  }

  // 打印
  print() {
    const params = {
      uidRes: this.authparams.uidAuthFuction,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.getticketSvc.print(params).subscribe(res => {
      if (res.status.status === 0) {
        this.printTemp();
      }
    });
  }

  // 调用票版 打印一张影票
  printTemp() {
    const params = {
      seatCode: this.rowData.resCode,
      typeCodeList: ['T001'],
      uidBill: this.detail.uid,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    // res.data 调用外壳打印票据方法
    const methodName = '/printTempletService-api/templetPrint/printTemp';
    this.voucherPrinter.print(params, methodName, (res) => {
      if (res.status === '0') {
        this.message.success('打印电影票成功', {nzDuration: 2000});
      } else {
        this.message.error(res.msg, {nzDuration: 2000});
      }
    });
  }

  // 调用票版 打印多张影票
  printMoreTemp() {
    const params = {
      typeCode: 'T001',
      uidBill: this.detail.uid,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    // res.data 调用外壳打印票据方法
    this.voucherPrinter.print(params, null, (res) => {
      this.init();
      if (res.status === '0') {
        this.message.success('打印电影票成功', {nzDuration: 2000});
      } else {
        this.message.error(res.msg, {nzDuration: 2000});
      }
    });
  }

  // 获取影票信息串
  getTicketCodeInfo(uidComp, uidPosBill) {
    const params = {uidPosBill};
    this.toastSvc.loading('正在处理...', 0);
    this.getticketSvc.getTicketCodeInfo(params).subscribe(res => {
      this.toastSvc.hide();
      console.log('获取影票信息码串=>');
      console.log(res);
      if (res.status.status === 0) {// 成功
        let datas = res.data;
        if (!datas) {
          datas = [];
        }
        const size = datas.length;
        if (size === 0) {
          // 包场
          if (this.index === 2) {
            this.printTask(uidPosBill);
          } else {
            this.pickupTicketPrint(uidComp, uidPosBill);
          }
          return;
        }
        this.invoke(0, size, datas, uidComp, uidPosBill);
      } else {
        this.message.error('获取影票信息失败');
      }
    });
  }

  // 获取影票信息码
  invoke(index, size, datas, uidComp, uidPosBill) {
    if (index >= size) {
      // 修改影票信息码
      this.updateTicketCodeInfo(datas, uidComp, uidPosBill);
      return;
    }
    const d = datas[index];
    const url = this.appSvc.currentCinema.codeUrl + encodeURIComponent(d.infoParams);
    console.log('获取影院影票信息码地址-->' + url);
    this.toastSvc.loading('正在处理...', 0);
    this.http.get(url, {responseType: 'text'})
    .pipe(timeout(5000))
    .subscribe(
      res => {
        this.toastSvc.hide();
        console.log('获取影院影票信息码地址,返回结果--> ' + res);
        res = decodeURIComponent(res);
        if (res.length === 172 || res.length === 180) {
          if (res.length === 172) {
            d.ticketCodeInfo = this.appSvc.currentCinema.cinemaCode + res;
            d.msg = '成功';
          } else {
            const cCode = res.substring(0, 8);
            if (cCode === this.appSvc.currentCinema.cinemaCode) {
              d.ticketCodeInfo = res;
              d.msg = '成功';
            } else {
              d.ticketCodeInfo = '';
              d.msg = '二维码信息不正确' + res;
            }
          }
        } else {
          d.ticketCodeInfo = '';
          d.msg = '二维码信息长度不够' + res;
        }
        index = index + 1;
        this.invoke(index, size, datas, uidComp, uidPosBill);
      },
      error => {
        this.toastSvc.hide();
        console.log('获取影院影票信息码失败');
        d.ticketCodeInfo = '';
        d.msg = '失败:(' + error.message + ')';
        index = index + 1;
        this.invoke(index, size, datas, uidComp, uidPosBill);
      });
  }

  // 修改影票信息码
  updateTicketCodeInfo(datas, uidComp, uidPosBill) {
    this.toastSvc.loading('正在处理...', 0);
    this.getticketSvc.updateTicketCodeInfo(datas).subscribe(res => {
      this.toastSvc.hide();
      // 包场
      if (this.index === 2) {
        this.printTask(uidPosBill);
      } else {
        this.pickupTicketPrint(uidComp, uidPosBill);
      }
    });
  }

  change(e) {
    console.log(e);
  }

  // 取票
  pickupTicket() {
    if (this.clickFlag) {
      return;
    }
    this.clickFlag = true;
    setTimeout(() => {
      this.clickFlag = false;
    }, 2000);
    if (this.appSvc.currentCinema.dockingType === '3') {
      this.getTicketCodeInfo(this.appSvc.currentCinema.uidComp, this.detail.uid);
    } else {
      this.pickupTicketPrint(this.appSvc.currentCinema.uidComp, this.detail.uid);
    }
  }

  pickupTicketPrint(uidComp, uidPosBill) {
    const params = {uidPosBill, uidComp};
    this.toastSvc.loading('正在处理...', 20000);
    this.getticketSvc.completeTakeTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.printMoreTemp();
        if (this.detail.isHasMer === 1) {
          const prams = {
            cinemaCode: this.appSvc.currentCinema.cinemaCode,
            billTakeCode: this.form.get('billTakeCode').value
          };
          this.nzmodal.confirm({
            nzTitle: '该订单同时购买了卖品！',
            nzContent: '',
            nzOkText: '去取货',
            nzOkType: 'primary',
            // nzOkDanger: true,
            nzOnOk: () => {
              this.zone.run(() => {
                this.router.navigate(['/pickup/index'], {queryParams: prams}).then();
              });
            },
            nzCancelText: '关闭',
            nzOnCancel: () => {
            }
          });
        }
      }
    });
  }

  // -------------------------------------预订取票-----------------------------------------
  // 键盘事件
  pressQuery(event) {
    if (event && event.keyCode === 13) {
      this.queryBook();
    }
  }

  // 清除
  clearBook() {
    this.bookform.get('ticketWithdrawal').setValue('');
    this.bookDatas = null;
    this.bookItem = null;
    setTimeout(() => {
      this.ticketWithdrawal.nativeElement.focus();
      this.showNum = true;
    }, 500);
  }

  // 会员卡
  readCard() {
    this.publicUtils.readCardSerialNum((res) => {
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.bookform.get('ticketWithdrawal').setValue(res.data);
          this.queryBook();
        }
      }
    });
  }

  // 预订取票
  queryBook() {
    if (this.bookform.invalid) {
      if (!this.bookform.get('ticketWithdrawal').value) {
        this.message.warning('请输入预留的编号、手机号、身份证号码或会员卡号');
      }
      return;
    }
    if (this.clickFlag) {
      return;
    }
    this.clickFlag = true;
    setTimeout(() => {
      this.clickFlag = false;
    }, 2000);
    const prams = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      ticketWithdrawal: this.bookform.get('ticketWithdrawal').value,
      notErrorInterceptor: true
    };
    this.bookDatas = null;
    this.bookItem = null;
    this.toastSvc.loading('正在处理...', 20000);
    this.getticketSvc.getBillSeatList(prams).subscribe(res => {
      this.toastSvc.hide();
      this.showNum = false;
      if (res.status.status === 0) {// 成功
        if (res.data && res.data != null && res.data.length > 0) {
          this.bookDatas = getBookDatas(res.data);
        }
      } else {
        this.message.remove();
        this.message.error(res.status.msg2Client);
        this.showNum = true;
      }
    });
  }

  // 选中
  selectItem(item) {
    this.bookItem = item;
    console.log(this.bookItem);
  }

  // 解锁
  unlock() {
    if (!this.bookItem) {
      return false;
    }
    this.nzmodal.confirm({
      nzTitle: '是否确认解锁座位？',
      nzContent: '',
      nzOkText: '确认',
      nzOkType: 'primary',
      // nzOkDanger: true,
      nzOnOk: () => {
        if (this.timerId) {
          clearTimeout(this.timerId);
          this.timerId = null;
        }
        const params = {
          uidShopCart: this.bookItem.uidShopCart
        };
        this.toastSvc.loading('正在解锁...', 20000);
        this.getticketSvc.unlock(params).subscribe(res => {
          this.setTimeOutCallback(() => {
            if (res.status.status === 0) {
              this.message.success('解锁成功!', {nzDuration: 2000});
              setTimeout(() => {
                this.queryBook();
              }, 500);
            } else {
              this.message.error('解锁失败!', {nzDuration: 2000});
            }
          });
        });
      },
      nzCancelText: '取消',
      nzOnCancel: () => {
      }
    });
  }

  // 延时
  delayed() {
    if (!this.bookItem) {
      return false;
    }
    const params = {
      showTimeStart: this.bookItem.showTimeStart,
      uidList: this.bookItem.uidSeats
    };
    this.delayedModal(params);
  }

  // 显示延时界面
  async delayedModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: DelayedComponent,
      componentProps: {params},
      cssClass: 'delayed-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.message.success('延时成功!', {nzDuration: 2000});
      setTimeout(() => {
        this.queryBook();
      }, 500);
    }
  }

  // 取票
  getticket() {
    console.log(this.bookItem);
    if (!this.bookItem) {
      return;
    }
    const params = {
      uidShopCart: this.bookItem.uidShopCart,
      terminalCode: this.authSvc.currentTerminalCode
    };
    this.toastSvc.loading('正在处理...', 20000);
    this.getticketSvc.pickUpTicket(params).subscribe(res => {
      this.setTimeOutCallback(() => {
        if (res.status.status === 0) {
          this.shoppingCartSvc.setCurrentCart(this.bookItem.uidShopCart);
          // 计算排片的日期;
          const date = new Date(new Date(this.datePipe.transform(this.bookItem.showTimeStart, 'yyyy-MM-dd HH:mm:ss')).getTime()
            - ((6 * 3600000) - 1));
          this.ticketSvc.updateDateStatus(date);
          this.zone.run(() => {
            const url = this.appSvc.currentDefaultUrl;
            this.router.navigate([url], {queryParams: {plan: this.bookItem.uidPlan, recovery: true}}).then();
          });
        }
      });
    });
  }

  // -------------------------------------包场确认-----------------------------------------
  // 键盘事件
  pressBlock(event) {
    if (event && event.keyCode === 13) {
      this.queryBlock();
    }
  }

  // 清除
  clearBlock() {
    this.blockform.get('orderId').setValue('');
    this.blockDetail = null;
    this.blockPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
    setTimeout(() => {
      this.orderId.nativeElement.focus();
      this.showNum = true;
    }, 500);
  }

  // 包场查询
  queryBlock() {
    if (!this.blockform.get('orderId').value) {
      this.message.warning('请输入订单号');
      return;
    }
    const params = {
      orderId: this.blockform.get('orderId').value,
      billVerifyCode: '',
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      notErrorInterceptor: true
    };
    this.blockDetail = null;
    this.blockPage = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
    this.toastSvc.loading('正在处理...', 10000);
    this.getticketSvc.omsOrderDetailQuery(params).subscribe(res => {
      this.toastSvc.hide();
      this.showNum = false;
      if (res.status.status === 0 && res.data && res.data != null) {
        this.blockDetail = res.data;
        if (this.blockDetail.omsOrderHallBookTime.bookEndTimeStr != null) {
          const end = this.blockDetail.omsOrderHallBookTime.bookEndTimeStr.substring(10);
          this.blockDetail.omsOrderHallBookTime.blocktime = this.blockDetail.omsOrderHallBookTime.bookStartTimeStr + ' 至 ' + end;
        } else {
          this.blockDetail.omsOrderHallBookTime.blocktime = '';
        }
        const datas = this.blockDetail.omsOrderHallBookTime.bookScheme.bookOrderGoods;
        this.blockPage.datas = datas;
        this.blockPage.total = datas.length;
      } else {
        this.message.info(res.status.msg2Client);
        this.showNum = true;
      }
    });
  }

  // 回调方法
  setTimeOutCallback(callback?) {
    this.timerId = setTimeout(() => {
      this.toastSvc.hide();
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      if (callback) {
        callback();
      }
    }, 1000);
  }

  // 确认出票
  confirmBlock() {
    if (this.clickFlag) {
      return;
    }
    this.clickFlag = true;
    setTimeout(() => {
      this.clickFlag = false;
    }, 2000);
    const params = {
      omsOrderDetailDTO: this.blockDetail.omsOrderDetail,
      bookMovieDTO: this.blockDetail.omsOrderHallBookTime.bookMovie,
      omsOrderHallBookTimeDTO: this.blockDetail.omsOrderHallBookTime,
      uidComp: this.appSvc.currentCinema.uidComp,
      bookOrderGoods: this.blockDetail.omsOrderHallBookTime.bookScheme.bookOrderGoods,
      terminalCode: this.authSvc.currentTerminalCode,
      notErrorInterceptor: true
    };
    this.toastSvc.loading('正在处理...', 30000);
    this.getticketSvc.confirmBlockPlan(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data && res.data.uidPosBill) {
        this.printTicket(res.data.uidPosBill);
      } else {
        let msg = '没有返回订单信息，打印失败';
        if (res.status.msg2Client) {
          msg = res.status.msg2Client;
        }
        this.message.warning(msg);
      }
    });
  }

  printTicket(uidPosBill) {
    console.log('打印');
    const uidComp = this.appSvc.currentCinema.uidComp;
    if (this.appSvc.currentCinema.dockingType === '3') {
      this.getTicketCodeInfo(uidComp, uidPosBill);
    } else {
      this.printTask(uidPosBill);
    }
  }

  printTask(uidPosBill) {
    console.log('打印');
    const tasks = [];
    const printTicketLen = this.blockDetail.omsOrderHallBookTime.vistorNum;
    const bookOrderGoods = this.blockDetail.omsOrderHallBookTime.bookScheme.bookOrderGoods;
    const uidComp = this.appSvc.currentCinema.uidComp;
    let billHaveGoods = '';
    if (printTicketLen && printTicketLen > 0) {
      console.log('printTicketLen-->', printTicketLen);
      // 影票打印
      const paramData = {
        uidComp,
        uidBill: uidPosBill,
        typeCode: 'T001'
      };
      billHaveGoods = 'ticket';
      tasks.push(paramData);
    }
    if (bookOrderGoods && bookOrderGoods.length > 0) {
      if (billHaveGoods === 'ticket') {
        billHaveGoods = 'ticket_and_mer';
      } else {
        billHaveGoods = 'mer';
      }
    }
    if (billHaveGoods !== '') {
      // 影票交易小票
      const paramData = {
        uidComp,
        uidBill: uidPosBill,
        typeCode: 'T00206',
        typeCodePrint: 'jiaoyixipiao',
        billHaveGoods: this.blockDetail.omsOrderHallBookTime.bookScheme.bookOrderGoods
      };
      tasks.push(paramData);
    }
    if (tasks && tasks.length > 0) {
      let printTicketFlag = false;
      let takseLens = tasks.length;
      console.log('打印任务数takseLens：-->', takseLens);
      this.voucherPrinter.printTask(tasks, (printResult) => {
        takseLens = takseLens - 1;
        console.log('还剩打印任务数takseLens-->', takseLens);
        console.log('打印返回结果--》', printResult.typeCode + ',-->' + new Date());
        if (printResult.status === '0') {
          if (printResult.typeCode === 'T001') {
            if (!printTicketFlag) {
              // 通知后台已经打印过影票
              console.log('通知后台已经打印过影票--》');
              this.completTakePrintTicket(uidComp, uidPosBill);
              printTicketFlag = true;
            }
          }
        }
        if (takseLens === 0) {
          let msg = '';
          if (printResult.status === '0') {
            msg = printResult.msg;
          } else if (printResult.status === '-1') {
            console.log('后台设置不需打印');
          } else {
            msg = '打印失败：' + printResult.msg;
          }
          console.log('打印返回结果--》', printResult + ',-->' + new Date());
          if (printResult.status !== '-1' && printResult.status !== '0') {
            this.message.error(msg, {nzDuration: 2000});
          }
        }
      });
    }
  }

  // 通知后台已经打印过影票
  completTakePrintTicket(uidComp, uidPosBill) {
    const params = {
      uidComp,
      uidPosBill
    };
    this.getticketSvc.completTakePrintTicket(params).subscribe(res => {
    });
  }

  // 关闭
  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }
}
