import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {PasswordService} from '../../../../../../@theme/modules/password';
import {VoucherPrinter} from '../../../../../../@core/utils/voucher-printer';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AppService} from '../../../../../../app.service';
import {AuthService} from '../../../../../auth/auth.service';
import {VipService} from '../../../../vip.service';

@Component({
  selector: 'app-vip-tabs-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsCancelComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  @Output() askForRefresh: EventEmitter<any> = new EventEmitter();
  memberDetail;
  card;
  subscribe;

  constructor(private datePipe: DatePipe,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private voucherPrinter: VoucherPrinter,
              private passwordSvc: PasswordService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private vipService: VipService
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('注销tab-结转监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    const card = memberDetail.cardSeleted;
    let refundMoney = card.remainMoneyCash + card.remainMoneyCift;
    if (card.cancellationFee) {
      refundMoney = refundMoney - card.cancellationFee;
    } else {
      card.cancellationFee = 0;
    }
    card.refundMoney = refundMoney;
    this.card = card;
    console.log('当前卡：', this.card.cardNo);
  }

  // 注销会员卡
  cancelCard() {
    // 需输入会员密码
    if (this.card.reCardStatus === -1) {
      this.message.error('该卡已注销，无法操作');
      return;
    }
    if (this.card.reCardStatus === -2) {
      this.message.error('该卡已冻结，无法操作');
      return;
    }
    if (this.card.overdue === 1) {
      this.message.error('该卡已过期，无法操作');
      return;
    }
    this.passwordSvc.show().subscribe(passWord => {
      if (!passWord) {
        return false;
      }
      const paramData = {
        cinemaCode: this.appSvc.currentCinema.cinemaCode,
        uidComp: this.appSvc.currentCinema.uidComp,
        terminalCode: this.authSvc.currentTerminalCode,
        uid: this.memberDetail.uid,
        uidMemberCard: this.card.uidMemberCard,
        memberPassword: passWord
      };
      console.log('参数', paramData);
      this.toastSvc.loading('正在处理,请稍后...', 0);
      this.vipService.cancellation(paramData).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          console.log('注销成功', res);
          this.printMemberBussinessTicket(res.data);
          this.message.success('注销成功');
          const notifier: any = {};
          notifier.toTabIndex = 12;
          this.refreshTabEvent.emit(notifier);
          this.askForRefresh.emit(true);
        } else {
          console.log('失败');
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  printMemberBussinessTicket(billRes) {
    console.log('打印会员业务小票');
    const tasks = [];
    const paramData: any = {};
    paramData.uidBill = billRes.uidPosBill;
    paramData.uidComp = billRes.uidComp;
    paramData.dicCode = 'printPcCert'; // 销卡编码
    paramData.typeCode = 'T00204'; // 销卡凭证
    tasks.push(paramData);
    if (tasks.length > 0) {
      this.voucherPrinter.printTask(tasks, (printResult) => {
        console.log('打印结果:', printResult);
        if (printResult.status === '0') {
          // 通知后台已经打印过影票
        } else if (printResult.status === '-1') {
          console.log('后台设置不需打印');
        } else {
          const msg = '打印失败：' + printResult.msg;
          console.log(msg);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
