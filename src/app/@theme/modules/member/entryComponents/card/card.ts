import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NavParams} from '@ionic/angular';
import {RmbPipe} from '../../../../pipes/pipes.pipe';
import {MemberService, CreateMemberCardInputDto} from '../../member.service';

@Component({
  selector: 'app-member-card',
  templateUrl: 'card.html',
  styleUrls: ['../../../../../../theme/ion-modal.scss', 'card.scss'],
  providers: [RmbPipe]
})
export class MemberCardComponent {
  memberLoginOutputData;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private memberSvc: MemberService) {
    this.memberLoginOutputData = navParams.data.memberLoginOutputData;
  }

  select(card) {
    this.modalController.dismiss(card).then();
    /*const dto: CreateMemberCardInputDto = {
      memberAlias: this.memberLoginOutputData.memberAlias,
      memberCardLevelName: card.cardLevelName,
      memberCardNo: card.cardNo,
      memberMobile: this.memberLoginOutputData.memberMobile,
      posShopCartResDTOList: [{
        cartResType: 3,
        uidResource: this.memberLoginOutputData.uid
      }],
      uidMember: this.memberLoginOutputData.uid,
      uidMemberCard: card.uidMemberCard,
      uidMemberCardLevel: card.uidCardLevel,
      uidMemberCardOld: '',
      cardLevelType: card.cardLevelType
    };
    this.memberSvc.create(dto).subscribe(res => {
      card.bussinessUid = res.data.uid;
      this.modalController.dismiss(card).then();
    });*/
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

}
