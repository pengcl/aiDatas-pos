import {Component, NgZone, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PublicUtils} from '../../../../../../@core/utils/public-utils';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {PasswordService} from '../../../../../../@theme/modules/password';
import {VoucherPrinter} from '../../../../../../@core/utils/voucher-printer';
import {NzMessageService} from 'ng-zorro-antd/message';
import {VipService} from '../../../../vip.service';

@Component({
  selector: 'app-vip-tabs-replacement',
  templateUrl: './replacement.component.html',
  styleUrls: ['./replacement.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsReplacementComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  @Output() askForRefresh: EventEmitter<any> = new EventEmitter();
  memberDetail;
  card;
  newCard; // 新卡
  subscribe;
  form: FormGroup = new FormGroup({
    readCardNo: new FormControl('', [Validators.required])
  });

  constructor(private zone: NgZone,
              private datePipe: DatePipe,
              private message: NzMessageService,
              private router: Router,
              private voucherPrinter: VoucherPrinter,
              private passwordSvc: PasswordService,
              private publicUtils: PublicUtils,
              private toastSvc: ToastService,
              private vipService: VipService
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('补卡tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    this.card = memberDetail.cardSeleted;
    console.log('当前卡：', this.card.cardNo);
  }

  // 会员卡
  readCard() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('readCardNo').setValue(res.data);
          this.readCardByCardNo();
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  // 获取新卡号信息
  readCardByCardNo() {
    console.log('获取新卡号信息');
    const form = this.form;
    if (form.invalid) {
      return false;
    }
    const cardType = this.publicUtils.getCardType();
    if (cardType === 0) {
      this.message.error('没有设置读卡器');
      return;
    }
    this.newCard = null;
    const params = {
      cardNo: form.value.readCardNo,
      cardType,
      uidCardLevel: this.card.uidCardLevel
    };
    this.vipService.patchReadCard(params).subscribe(res => {
      if (res.status.status === 0 && res.data) {
        console.log('返回新卡号信息-->', res.data);
        this.newCard = res.data;
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 会员卡补卡
  reissueCard() {
    if (this.newCard === null || this.newCard === undefined) {
      this.message.warning('请先读取新会员卡');
      return;
    }
    this.passwordSvc.show().subscribe(password => {
      if (!password) {
        return false;
      }
      const params = {
        cardCost: this.newCard.expense,
        uid: this.memberDetail.uid,
        memberPassword: password,
        oldUidCard: this.card.uidMemberCard,
        newUidCard: this.newCard.uid
      };
      console.log('补卡参数', params);
      this.toastSvc.loading('正在处理，请稍后...', 0);
      this.vipService.reissueCard(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0 && res.data) {
          console.log('补卡返回-->', res.data);
          if (res.data.uidPosBill) {
            // 补卡金额等于0时,补卡成功,然后触发会员查询
            this.printMemberBussinessTicket(res.data);
            this.message.success('补卡成功');
            const notifier: any = {};
            notifier.method = 'refreshMemberInfo';
            notifier.toTabIndex = 12;
            this.refreshTabEvent.next(notifier);
            this.askForRefresh.next(true);
          } else {
            console.log('需跳转到结算', res.data);
            const uidShopCart = res.data.uid;
            this.zone.run(() => {
              this.router.navigate(['/checkout/index'], {queryParams: {uidShopCart, businessType: 'MEMBER'}}).then();
            });
          }
        } else {
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  // 打印凭证
  printMemberBussinessTicket(billRes) {
    console.log('打印会员业务小票');
    const tasks = [];
    const paramData: any = {};
    paramData.uidBill = billRes.uidPosBill;
    paramData.uidComp = billRes.uidComp;
    paramData.dicCode = 'printSucCert';
    paramData.typeCode = 'T00210'; // 补卡凭证
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

  cancel() {
    console.log('取消');
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
