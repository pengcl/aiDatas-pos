import {Component, OnInit} from '@angular/core';
import {NavParams, ModalController} from '@ionic/angular';
import {interval as observerInterval} from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['../../../../theme/ion-modal.scss', './timer.component.scss']
})
export class TimerComponent implements OnInit {
  scheduler;
  timer;

  constructor(private navParams: NavParams,
              private modalController: ModalController) {
    this.scheduler = this.navParams.data.params.scheduler;
    this.timer = observerInterval(1000).subscribe(res => {
      if (this.scheduler > 0) {
        this.scheduler = this.scheduler - 1;
      } else {
        this.dismiss();
      }
    });
  }

  ngOnInit() {
  }

  confirm() {
    this.timer.unsubscribe();
    this.modalController.dismiss(true).then();
  }

  dismiss() {
    this.timer.unsubscribe();
    this.modalController.dismiss(false).then();
  }

}
