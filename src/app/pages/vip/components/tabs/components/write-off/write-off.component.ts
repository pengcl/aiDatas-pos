import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {PasswordService} from '../../../../../../@theme/modules/password';
import {VoucherPrinter} from '../../../../../../@core/utils/voucher-printer';
import {VipService} from '../../../../vip.service';

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
  selector: 'app-vip-tabs-write-off',
  templateUrl: './write-off.component.html',
  styleUrls: ['./write-off.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsWriteOffComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  @Output() askForUpdateMember: EventEmitter<any> = new EventEmitter();
  memberDetail;
  card;
  page = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 6,
    pageIndex: 1 // 当前页数
  };
  form: FormGroup = new FormGroup({
    channelCode: new FormControl('ALL', [])
  });
  subscribe;

  constructor(
    private datePipe: DatePipe,
    private message: NzMessageService,
    private toastSvc: ToastService,
    private passwordSvc: PasswordService,
    private vipService: VipService,
    private voucherPrinter: VoucherPrinter) {
  }

  ngOnInit() {
    this.form.get('channelCode').setValue('ALL');
    console.log(this.form.value);
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('冲销tab-结转监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    this.card = memberDetail.cardSeleted;
    this.resetData();
    // console.log('当前卡：', this.card.cardNo);
    this.queryMemCardRecharge();
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

  dateChange(target, e) {
    console.log(this.form.value);
  }

  change(target, e) {
    console.log(target, e);
  }

  // 充值记录查询
  queryMemCardRecharge() {
    if (!this.card) {
      return false;
    }
    const currentPage = 1;    // 当前页
    const params: any = {};
    params.uidMemberCard = this.card.uidMemberCard;      // 会员卡uid
    params.cardNo = this.card.cardNo;
    params.channelCode = this.form.get('channelCode').value;
    params.page = {
      currentPage: this.page.pageIndex,
      pageSize: this.page.pageSize
    };
    // console.log('充值记录查询');
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipService.queryMemCardRecharge(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        const rechargreList = res.data.detail;
        if (rechargreList && rechargreList.length > 0) {
          rechargreList.forEach(item => {
            item.cancelStatusName = item.cancelStatus === 0 ? '未冲销' : '已冲销';
            // 转换支付方式显示
            if (item.payModeDTOList && item.payModeDTOList.length > 0) {
              let str = '';
              item.payModeDTOList.forEach(pay => {
                str += pay.payModeName + pay.billPayAmount + ',';
              });
              str = str.substring(0, str.length - 1);
              item.payTypeNames = str;
            }
          });
        }
        this.page.pageIndex = res.data.page.currentPage;
        this.page.total = res.data.page.totalSize;
        this.page.datas = rechargreList;
      } else {
        console.log('失败');
      }
    });
  }

  changePageIndex(pageIndex) {
    this.page.pageIndex = pageIndex;
    this.queryMemCardRecharge();
  }

  // 充值冲销操作，需弹框输入会员密码
  cancelRecharge(rowData) {
    // console.log('rowData-->', rowData);
    this.passwordSvc.show().subscribe(passWord => {
      if (!passWord) {
        return false;
      }
      const params = {
        memberPassword: passWord,
        uidMember: this.memberDetail.uid,
        uidMemberCard: this.card.uidMemberCard,
        uidPosBill: rowData.uid,
        remainMoneyCash: rowData.billAmount,
        uidCampaign: rowData.uidCampaign
      };
      this.toastSvc.loading('正在处理...', 0);
      this.vipService.cancelRecharge(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          const cancelResult = res.data;
          if (cancelResult.payStatus === 1) {
            this.printCancelRecharge(cancelResult);
            const notifier: any = {};
            notifier.method = 'refreshMemberInfo';
            this.refreshTabEvent.next(notifier);
            this.message.success('冲销成功');
            this.askForUpdateMember.next();
          } else {
            this.message.error(cancelResult.payMessage);
          }
        } else {
          // 冲销失败
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  // 打印取消充值凭证
  printCancelRecharge(cancelResult) {
    const paramData = {
      typeCode: 'T00202', // 充值凭证
      uidBill: cancelResult.uidPosBill,
      uidComp: cancelResult.uidComp
    };
    const methodName = '/printTempletService-api/templetPrint/print';
    this.voucherPrinter.print(paramData, methodName, (res) => {
      if (res.status === '0') {
        console.log('打印成功');
      } else {
        console.log('打印失败', res.msg);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
