import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../../../@theme/modules/toast';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VipService } from '../../../../vip.service';
@Component({
  selector: 'app-vip-tabs-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsCardsComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  memberInfo;
  memberCard;
  now = new Date().getTime();
  subscribe;
  constructor(private datePipe: DatePipe,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private vipService: VipService,
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('会员卡tab-结转监听到会员信息变化');
        this.memberInfo = res;
        this.memberCard = res.memberReCardDTOs;
      }
    });
  }

  setDefaultCard(card) {
    const params = {
      uidMember: card.uidMember,
      uidMemberCard: card.uidMemberCard,
      cardNo: card.cardNo
    };
    console.log('设置默认卡参数', params);
    this.toastSvc.loading('正在处理...', 0);
    this.vipService.setDefualtCard(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        const notifier: any = {};
        notifier.method = 'refreshMemberInfo';
        this.refreshTabEvent.next(notifier);
        this.message.success('设置成功');
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
