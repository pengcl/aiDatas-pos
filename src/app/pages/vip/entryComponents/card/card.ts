import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { VipService } from '../../vip.service';
import { RmbPipe } from '../../../../@theme/pipes/pipes.pipe';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-vip-card',
  templateUrl: 'card.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', 'card.scss'],
  providers: [RmbPipe, NzMessageService]
})
export class VipCardComponent {
  memberLoginOutputData;
  now = new Date().getTime();

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private message: NzMessageService,
              private vipSvc: VipService
    ) {
    this.memberLoginOutputData = navParams.data.memberLoginOutputData;
  }

  confirm() {
    /*this.memberSvc.create({}).subscribe(res => {
      /!*const dto: CreateMemberCardInputDto = {
        memberAlias: res.data.memberAlias;
        memberCardLevelName: '',
        memberCardNo: string;
        memberMobile: res.data.memberPhone;
        posShopCartResDTOList: CartResInputDto[];
        uidMember: string;
        uidMemberCard: string;
        uidMemberCardLevel: string;
        uidMemberCardOld: string;
        cardLevelType: number;
      };*!/
      this.modalController.dismiss(res.data).then();
    });*/
  }

  setDefaultCard(card) {
    console.log('设置默认卡', card);
    const params = {
      uidMember: card.uidMember,
      uidMemberCard: card.uidMemberCard,
      cardNo: card.cardNo
    };
    this.vipSvc.setDefualtCard(params).subscribe(res => {
      if (res.status.status === 0) {
        this.message.success('设置成功');
      } else {
        console.log('失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }

  select(card) {
    this.modalController.dismiss(card).then();
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

  clickNumber(strNum: string) {
    // this.conditions = this.conditions + strNum;
  }

}
