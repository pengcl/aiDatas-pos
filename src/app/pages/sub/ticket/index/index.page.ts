import {Component, OnInit} from '@angular/core';
import {CacheService} from '../../../../@core/utils/cache.service';

@Component({
  selector: 'app-sub-ticket-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: []
})
export class SubTicketIndexPage implements OnInit {
  didEnter = false;

  constructor() {
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.didEnter = true;
  }

  ionViewDidLeave() {
    this.didEnter = false;
  }

}
