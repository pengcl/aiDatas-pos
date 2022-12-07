import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {NavParams} from '@ionic/angular';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-checkout-memberCard-card',
  templateUrl: 'card.Component.html',
  styleUrls: ['../../../../../../theme/ion-modal.scss','./card.component.scss'],
  providers: [DatePipe]
})
export class CheckoutMemberCardCardComponent {
  memberLoginOutputData;

  constructor(private navParams: NavParams,
              private modalController: ModalController) {
    const modalParams = this.navParams.data.params;
    this.memberLoginOutputData = modalParams.memberDetail;
  }

  confirm() {

  }

  select(card) {
    this.modalController.dismiss(card).then();
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

}
