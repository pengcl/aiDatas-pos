import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NavParams} from '@ionic/angular';
import {VipService} from '../../vip.service';
import {RmbPipe} from '../../../../@theme/pipes/pipes.pipe';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-vip-couponsV2',
  templateUrl: 'couponsV2.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', 'couponsV2.scss'],
  providers: [RmbPipe, NzMessageService]
})
export class VipCouponsV2Component {
  items;
  uid;
  type = {
    1: '兑换券',
    2: '优惠券',
    3: '代金券'
  };

  category = {
    1: '影票券',
    2: '卖品券',
    3: '混合券'
  };

  ticketStatus = {
    1: '未激活',
    2: '已激活',
    3: '已消费',
    4: '已退货',
    5: '已停用',
    6: '已作废'
  };

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private message: NzMessageService,
              private vipSvc: VipService) {
    this.uid = navParams.data.uid;
    this.getData();
  }

  getData() {
    this.vipSvc.operateCoupons({uidPosBill: this.uid}).subscribe(res => {
      console.log(res);
      this.items = res.data.memberTikcetList;
    });
  }

  confirm() {
    this.modalController.dismiss().then();
  }

}
