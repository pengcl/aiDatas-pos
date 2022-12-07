import {AfterViewInit, Component} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';

import {DelayedService} from './delayed.service';
import {TicketService} from '../../../pages/ticket/ticket.service';


@Component({
  selector: 'app-delayed',
  templateUrl: 'delayed.html',
  styleUrls: ['delayed.scss']
})
export class DelayedComponent implements AfterViewInit {

  params = this.navParams.data.params;
  defaultDatas = [];
  select;

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private ticketSvc: TicketService,
              private delayedSvc: DelayedService) {
  }

  ngAfterViewInit() {
    const filterArr = [
      {name: '不解锁', id: 0, values: 0},
      {name: '开映前2小时', id: 1, values: 120},
      {name: '开映前1小时', id: 2, values: 60},
      {name: '开映前30分钟', id: 3, values: 30},
      {name: '开映前20分钟', id: 4, values: 20},
      {name: '开映前10分钟', id: 5, values: 10}
    ];
    this.select = filterArr[0];
    const showTimeStart = this.params.showTimeStart;
    filterArr.forEach(item => {
      if ((new Date(showTimeStart).getTime() - new Date().getTime()) > (item.values * 60000) || item.values === 0) {
        this.defaultDatas.push(item);
      }
    });
  }

  commit() {
    const request = {
      delayedTime: this.select.values,
      uidList: this.params.uidList
    };
    this.delayedSvc.delay(request).subscribe(res => {
      if (res.status.status === 0) {
        const showTimeStart = new Date(this.params.showTimeStart).getTime();
        this.ticketSvc.updateReleaseTime(showTimeStart - this.select.values * 60000);
        this.modalController.dismiss(res).then();
      }
    });
  }

  changeDelayTime(data) {
    this.select = data;
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

}
