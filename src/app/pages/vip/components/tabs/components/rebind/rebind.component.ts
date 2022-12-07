import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {VoucherPrinter} from '../../../../../../@core/utils/voucher-printer';
import {PublicUtils} from '../../../../../../@core/utils/public-utils';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AppService} from '../../../../../../app.service';
import {CardService} from '../../../../../card/card.service';
import {VipService} from '../../../../vip.service';

@Component({
  selector: 'app-vip-tabs-rebind',
  templateUrl: './rebind.component.html',
  styleUrls: ['./rebind.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsRebindComponent implements OnInit, OnDestroy {
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
              private appSvc: AppService,
              private cardSvc: CardService,
              private vipService: VipService) {
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
    console.log(this.card);
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

  rebind() {
    this.toastSvc.loading('读卡中...', 0);
    this.publicUtils.readCardSerialNum((res) => {
      this.toastSvc.hide();
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.bind(this.card.uidMemberCard, res.data);
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  bind(uid, cardNoPhysical) {
    this.toastSvc.loading('绑卡中...', 0);
    this.cardSvc.writeOrBind(uid, cardNoPhysical).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.toastSvc.success('绑定成功!', 1000);
      } else {
        this.toastSvc.success('绑卡失败!', 1000);
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
      this.message.warning('卡面号码与卡芯片号码一致，无需绑定');
      return;
    } else {
      this.rebind();
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
