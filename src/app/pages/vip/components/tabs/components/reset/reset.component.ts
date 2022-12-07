import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../../../@theme/modules/toast';
import { VoucherPrinter } from '../../../../../../@core/utils/voucher-printer';
import { PublicUtils } from '../../../../../../@core/utils/public-utils';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VipService } from '../../../../vip.service';

@Component({
  selector: 'app-vip-tabs-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsResetComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  memberDetail;
  card;
  readCardNo;
  subscribe;
  constructor(private datePipe: DatePipe,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private voucherPrinter: VoucherPrinter,
              private publicUtils: PublicUtils,
              private vipService: VipService
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('重置卡tab-结转监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    this.card = memberDetail.cardSeleted;
    this.readCardNo = '';
    console.log('当前卡：', this.card.cardNo);
  }

  // 会员卡
  readCard() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.readCardNo = res.data;
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }


  // 重置卡
  resetCard() {
    const cardNo = this.card.cardNo;
    const newCardNo = this.readCardNo;
    if (newCardNo === '' || newCardNo === null) {
      this.message.warning('请读卡');
      return;
    }
    if (newCardNo === cardNo) {
      this.message.warning('卡面号码与卡芯片号码一致，无需重置');
      return;
    } else {
      // 重置卡号后，会将卡面卡号写入到芯片
      this.writeCard();
    }
  }

  // 写卡
  writeCard() {
    const cardNo = this.card.cardNo;
    console.log('开始写卡', cardNo);
    this.toastSvc.loading('正在处理，请稍后...', 0);
    this.publicUtils.writeCardMemberID(cardNo, function(res, err) {
      this.toastSvc.hide();
      console.log('写卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        this.readCard();
        this.message.success('恭喜你写卡成功');
        const notifier: any = {};
        notifier.method = 'refreshMemberInfo';
        // notifier.toTabIndex = 0;
        this.refreshTabEvent.next(notifier);
      } else {
        console.log('写卡失败', res.msg);
        this.message.warning(res.msg);
      }
    });
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
