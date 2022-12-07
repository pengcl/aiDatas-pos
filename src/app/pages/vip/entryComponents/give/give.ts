import {Component} from '@angular/core';
import {FormGroup, FormControl, FormBuilder, Validators, FormArray} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {NavParams} from '@ionic/angular';
import {VipService} from '../../vip.service';

@Component({
  selector: 'app-vip-give',
  templateUrl: 'give.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', 'give.scss'],
  providers: []
})
export class VipGiveComponent {
  params;
  form: FormGroup;

  constructor(private navParams: NavParams,
              private fb: FormBuilder,
              private modalController: ModalController,
              private vipSvc: VipService) {
    this.params = navParams.data.params;
    this.form = this.fb.group({
      memberMobile: this.fb.control(this.params.memberMobile, []),
      memberCard: this.fb.control(this.params.memberCard, []),
      ticketGifts: this.fb.array([])
    });
    this.params.ticketGifts.forEach(item => {
      this.addTicketGiftControl(item);
    });
  }

  createForm(item) {
    return this.fb.group({
      ticketName: this.fb.control(item.ticketName, [Validators.required]),
      discountAmount: this.fb.control(item.discountAmount, [Validators.required, Validators.min(0)]),
      merUid: this.fb.control(item.merUid, [Validators.required])
    });
  }

  addTicketGiftControl(item) {
    const ticketGiftControls = this.form.get('ticketGifts') as FormArray;
    ticketGiftControls.push(this.createForm(item));
  }

  confirm() {
    this.modalController.dismiss(this.form.value).then();
  }

  select(card) {
    this.modalController.dismiss(card).then();
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

}
