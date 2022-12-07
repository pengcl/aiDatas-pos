import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ToastService } from '../../modules/toast';
import { DatePipe } from '@angular/common';
import { NavParams, ModalController } from '@ionic/angular';
import { AppService } from '../../../app.service';
import { AuthService } from '../../../pages/auth/auth.service';
import { VipService } from '../../../pages/vip/vip.service';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activityDetail.component.html',
  styleUrls: ['../../../../theme/ion-modal.scss', './activityDetail.component.scss'],
  providers: [DatePipe]
})
export class ActivityDetailComponent implements OnInit {
  activity = null;
  constructor(private navParams: NavParams,
              private modalController: ModalController) {
    this.activity = this.navParams.data.activity;
    console.log(this.activity);
  }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss().then();
  }
}
