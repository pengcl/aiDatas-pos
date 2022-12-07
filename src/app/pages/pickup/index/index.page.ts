import {AfterViewInit, NgZone, Component, ElementRef, ViewChild} from '@angular/core';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {PickupService} from '../pickup.service';
import {DialogService} from '../../../@theme/modules/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {getResComboListData, getDeletData} from '../pickup.utils';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../../@theme/modules/toast';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-pickup-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService, NzModalService]
})
export class PickupIndexPage implements AfterViewInit {

  form: FormGroup = new FormGroup({
    billTakeCode: new FormControl('', [Validators.required])
  });
  detail;
  show = false;
  page = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 7,
    pageIndex: 1 // 当前页数
  };
  timerId;
  showNum = false;
  clickFlag = false;
  @ViewChild('billTakeCode', {static: false}) private billTakeCode: ElementRef;

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private dialogSvc: DialogService,
              private appSvc: AppService,
              private pickupSvc: PickupService,
              private authSvc: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private toastSvc: ToastService,
              private voucherPrinter: VoucherPrinter,
              private message: NzMessageService,
              private nzmodal: NzModalService) {
  }

  ngAfterViewInit() {
    let flag = false;
    if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.billTakeCode) {
      const code = this.route.snapshot.queryParams.billTakeCode;
      this.form.get('billTakeCode').setValue(code);
      this.changeKeyupNumber('billTakeCode');
      flag = true;
      this.query();
    }
    if (!flag) {
      setTimeout(() => {
        this.billTakeCode.nativeElement.focus();
        this.showNum = true;
      }, 500);
    }
  }

  // 键盘事件
  pressQuery(event) {
    if (event && event.keyCode === 13) {
      this.query();
    }
  }

  focusInput() {
    this.showNum = true;
  }

  hideNum() {
    this.showNum = false;
  }

  clickNumber(strNum: string) {
    let code = this.form.get('billTakeCode').value;
    if (strNum === 'del') {
      code = code.slice(0, code.length - 1);
    } else {
      if (code.length >= 17) {
        return;
      }
      code = code + strNum;
    }
    this.form.get('billTakeCode').setValue(code);
    this.changeKeyupNumber('billTakeCode');
  }

  changeKeyupNumber(target) {
    const e = this.form.get(target).value;
    let sb = e.replace(/[^\d]/g, '');
    this.form.get(target).setValue(sb);
  }

  clear() {
    this.form.get('billTakeCode').setValue('');
    this.show = false;
    this.detail = null;
    this.page = {
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

  // 查询
  query() {
    if (this.form.invalid) {
      this.message.warning('请输入取货码及验证码');
      return;
    }
    let billTakeCode = this.form.get('billTakeCode').value;
    billTakeCode = billTakeCode.replace(/[^\d]/g, '');
    if (billTakeCode.length !== 12 && billTakeCode.length !== 15) {
      this.message.warning('请输入正确取货码及验证码');
      return;
    }
    let takeCode = '';
    let verifyCode = '';
    if (billTakeCode.length === 12){
      takeCode = billTakeCode.substring(0, 6);
      verifyCode = billTakeCode.substring(6, 12);
    }else{
      takeCode = billTakeCode.substring(0, 9);
      verifyCode = billTakeCode.substring(9, 15);
    }
    const inputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      billTakeCode: takeCode,
      billVerifyCode: verifyCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.show = false;
    this.showNum = false;
    this.detail = null;
    this.page = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 7,
      pageIndex: 1 // 当前页数
    };
    this.toastSvc.loading('正在处理...', 800);
    this.pickupSvc.getBillResList(inputDto).subscribe(res => {
      this.timerId = setTimeout(() => {
        this.toastSvc.hide();
        if (this.timerId) {
          clearTimeout(this.timerId);
          this.timerId = null;
        }
        if (res.status.status === 0) {
          if (res.data.orderStatus === 0 && res.data.isCompleteTake === 0) {
            this.show = true;
            this.detail = res.data;
            this.detail.datas = [];
            // 处理卖品、套餐内容
            const resComboList = res.data.resComboList;
            const resList = res.data.resList;
            let allArr = [];
            if (resComboList && resComboList.length > 0) {
              const hlArr = getResComboListData(resComboList, 'X');
              allArr = allArr.concat(hlArr);
            }
            if (resList && resList.length > 0) {
              const hlArr2 = getResComboListData(resList, 'X');
              allArr = allArr.concat(hlArr2);
            }
            const goods = getDeletData(allArr, 'uidPosResCombo', 'pSum', 'pice');
            this.page.datas = goods[2];
          } else if (res.data.orderStatus === 1 || res.data.orderStatus === 2) {
            this.message.info('取货码错误或者订单未完成');
          } else if (res.data.isCompleteTake === 1) {
            if (res.data.isHasTicket === 1) {
              const pars = {billTakeCode};
              this.nzmodal.confirm({
                nzTitle: '没有可取商品，但该订单还有电影票未取',
                nzContent: '',
                nzOkText: '去取票',
                nzOkType: 'primary',
                // nzOkDanger: true,
                nzOnOk: () => {
                  this.zone.run(() => {
                    this.router.navigate(['/getticket/index'], {queryParams: pars}).then();
                  });
                },
                nzCancelText: '关闭',
                nzOnCancel: () => {
                }
              });
            } else if (res.data.isHasTicket === 0) {
              this.message.info('没有可取商品');
            }
          }
        } else {
          this.message.error('服务异常', {nzDuration: 2000});
        }
      }, 300);
    });
  }

  // 取货
  pickup() {
    if (this.detail && this.detail.uid !== '') {
      if (this.clickFlag){
        return;
      }
      this.clickFlag = true;
      setTimeout(() => {
        this.clickFlag = false;
      }, 2000);
      const pickupRequest = {
        uidPosBill: this.detail.uid,
        uidResComboList: [],
        uidResList: [],
        teminalCode: this.authSvc.currentTerminalCode,
        cinemaCode: this.appSvc.currentCinema.cinemaCode,
        notErrorInterceptor: true
      };
      const isHasTicket = this.detail.isHasTicket;
      const uidResComboList = this.detail.resComboList;
      if (uidResComboList && uidResComboList.length > 0) {
        uidResComboList.forEach(item => {
          pickupRequest.uidResComboList.push(item.uid);
        });
      }
      const uidResList = this.detail.resList;
      if (uidResList && uidResList.length > 0) {
        uidResList.forEach(item => {
          pickupRequest.uidResList.push(item.uid);
        });
      }
      this.pickupSvc.getCompletTakeRes(pickupRequest).subscribe(res => {
        if (res.status.status === 0) {
          const takeCode = this.form.get('billTakeCode').value;
          this.clear();
          // 调用打印模块 print
          this.templetPrint(pickupRequest, result => {
            let isShow = false;
            if (result.status !== '0') {
              this.message.error(result.msg, {nzDuration: 2000});
              isShow = true;
            }
            if (isHasTicket === 1) {
              // 弹出页面 该订单同时购买了电影票！
              const inputDto = {
                cinemaCode: this.appSvc.currentCinema.cinemaCode,
                billTakeCode: takeCode,
                uidComp: this.appSvc.currentCinema.uidComp
              };
              this.nzmodal.confirm({
                nzTitle: '该订单同时购买了电影票',
                nzContent: '',
                nzOkText: '去取票',
                nzOkType: 'primary',
                nzOnOk: () => {
                  this.zone.run(() => {
                    this.router.navigate(['/getticket/index'], {queryParams: inputDto}).then();
                  });
                },
                nzCancelText: '关闭',
                nzOnCancel: () => {
                }
              });
            } else if (!isShow) {
              // 提示取货成功
              this.message.success('取货成功', {nzDuration: 2000});
            }
          });
        } else {
          // 提示取货失败
          this.message.error(res.status.msg2Client, {nzDuration: 2000});
        }
      });
    }
  }

  templetPrint(pickupRequest, callback) {
    const params = {
      typeCode: 'T00207',
      uidBill: pickupRequest.uidPosBill,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.voucherPrinter.print(params, null, (res) => {
      callback(res);
    });
  }

  change(e) {
    console.log(e);
  }

  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }
}
