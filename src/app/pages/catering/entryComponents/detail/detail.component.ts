import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';

import {CateringService} from '../../catering.service';

@Component({
  selector: 'app-catering-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './detail.component.scss'],
  providers: [DatePipe]
})
export class CateringDetailComponent {
  data;
  item;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private cateringSvc: CateringService) {
    this.item = this.navParams.data;
    this.getData(this.item.uidBill);
  }

  getData(uid) {
    this.cateringSvc.item(uid).subscribe(res => {
      this.data = res.data;
      console.log(this.data, this.item);
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }
}
