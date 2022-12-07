import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-ticket-hall-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['../../../../../../../../theme/ion-modal.scss', './notification.component.scss'],
  providers: [DatePipe]
})
export class TicketHallNotificationComponent {
  bookData;
  form: FormGroup = new FormGroup({
    reserveMemoryNum: new FormControl('', [Validators.required]),
    reserveRemark: new FormControl('', [])
  });

  constructor(private navParams: NavParams,
              private datePipe: DatePipe,
              private modalController: ModalController) {
    this.bookData = this.navParams.data;
  }

  formatTime(date) {
    const timeStamp = new Date().getTime() - new Date(date).getTime();
    return this.datePipe.transform(timeStamp, 'HH小时mm分');
  }

  dismiss(type) {
    if (type === 'pay' && this.form.invalid) {
      return false;
    }
    this.modalController.dismiss(type ? {type, value: this.form.value} : null).then();
  }

}
