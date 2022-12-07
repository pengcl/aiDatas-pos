import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-ticket-hall-book',
  templateUrl: './book.component.html',
  styleUrls: ['../../../../../../../../theme/ion-modal.scss', './book.component.scss'],
  providers: [DatePipe]
})
export class TicketHallBookComponent {
  bookData;
  form: FormGroup = new FormGroup({
    reserveMemoryNum: new FormControl('', [Validators.required]),
    isReleaseLockMm: new FormControl('', []),
    reserveRemark: new FormControl('', [])
  });

  constructor(private navParams: NavParams,
              private datePipe: DatePipe,
              private modalController: ModalController) {
    this.bookData = this.navParams.data;
    console.log(this.bookData);
  }

  formatTime(date) {
    const timeStamp = new Date().getTime() - new Date(date).getTime();
    return this.datePipe.transform(timeStamp, 'HH小时mm分');
  }

  pay() {
    if (this.form.invalid) {
      return false;
    }
    this.modalController.dismiss(this.form.value).then();
  }

  dismiss() {
    this.modalController.dismiss(null).then();
  }

}
