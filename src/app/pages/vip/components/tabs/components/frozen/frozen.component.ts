import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {PasswordService} from '../../../../../../@theme/modules/password';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {VipService} from '../../../../vip.service';

@Component({
  selector: 'app-vip-tabs-frozen',
  templateUrl: './frozen.component.html',
  styleUrls: ['./frozen.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsFrozenComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  memberDetail;
  card;
  subscribe;

  constructor(private datePipe: DatePipe,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private passwordSvc: PasswordService,
              private vipService: VipService
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('冻结tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    const card = memberDetail.cardSeleted;
    if (card.reCardStatus === 0) {
      card.reCardStatusName = '正常';
    } else if (card.reCardStatus === -2) {
      card.reCardStatusName = '已冻结';
    }
    this.card = card;
    console.log('当前卡：', this.card.cardNo);
  }

  // 冻结或解冻
  freezeOrThawCard() {
    // 需输入会员密码
    this.passwordSvc.show().subscribe(password => {
      if (!password) {
        return false;
      }
      if (this.card.reCardStatus === 0) {
        const params = {
          reCardStatus: 0,
          uid: this.memberDetail.uid,
          uidMemberCard: this.card.uidMemberCard,
          memberPassword: password
        };
        console.log('冻结参数', params);
        this.toastSvc.loading('正在处理...', 0);
        this.vipService.freezeCard(params).subscribe(res => {
          this.toastSvc.hide();
          if (res.status.status === 0) {
            console.log('成功');
            const card = this.card;
            card.reCardStatus = -2;
            card.reCardStatusName = '已冻结';
            this.card = card;
            this.message.success('冻结成功');
            const notifier: any = {};
            notifier.toTabIndex = 12;
            this.refreshTabEvent.next(notifier);
          } else {
            this.message.error(res.status.msg2Client);
          }
        });
      } else if (this.card.reCardStatus === -2) {
        const params = {
          uid: this.memberDetail.uid,
          uidMemberCard: this.card.uidMemberCard,
          reCardStatus: -2,
          memberPassword: password
        };
        console.log('解冻参数', params);
        this.toastSvc.loading('正在处理...', 0);
        this.vipService.thawCard(params).subscribe(res => {
          this.toastSvc.hide();
          if (res.status.status === 0) {
            const card = this.card;
            card.reCardStatus = 0;
            card.reCardStatusName = '正常';
            this.card = card;
            this.message.success('解冻成功');
            const notifier: any = {};
            notifier.toTabIndex = 12;
            this.refreshTabEvent.next(notifier);
          } else {
            this.message.error(res.status.msg2Client);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
