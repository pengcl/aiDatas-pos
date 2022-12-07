import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VipCardComponent } from '../../entryComponents/card/card';
import { VipService } from '../../vip.service';
@Component({
  selector: 'app-vip-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class VipInfoComponent implements OnInit {
  show = { more: false };
  cardSeleted;  // 选择的卡号
  _memberDetail;
  @Input() set memberDetail(value) {
    this._memberDetail = value;
    this.memberDetailChange(this._memberDetail);

  }
  get memberDetail() {
    return this._memberDetail;

  }
  @Input() disabled;
  constructor(private modalController: ModalController, private vipService: VipService) {

  }

  ngOnInit() {

  }

  memberDetailChange(memberDetail) {
    console.log('会员信息变化了，获取新选择的卡号：', memberDetail.cardSeleted ? memberDetail.cardSeleted.cardNo : '');
    this.cardSeleted = memberDetail.cardSeleted;
  }

  async presentCardModal() {
    const memberLoginOutputData = this.memberDetail;
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: VipCardComponent,
      cssClass: 'member-card-modal',
      componentProps: { memberLoginOutputData }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss(); // 获取选中的会员卡
    if (data) {
      const memberDetail = this.memberDetail;
      memberDetail.cardSeleted = data;  // 设置选中的会员卡
      this.memberDetail = memberDetail;
      this.vipService.updateMemberDetail(this.memberDetail);
    }
  }

}
