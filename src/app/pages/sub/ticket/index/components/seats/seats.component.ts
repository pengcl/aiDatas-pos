import {
  Component,
  NgZone,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {DatePipe} from '@angular/common';
import {fromEvent} from 'rxjs';
import {CacheService} from '../../../../../../@core/utils/cache.service';
import {
  getMost,
  getScale,
  getStyle,
  getRegion
} from '../../../../../ticket/index/components/hall/components/seats/seats.extend';
import {interval as observableInterval} from 'rxjs';
import {SubPlansIndexPage} from '../../../../plans/index.page';
import {SubDto} from '../../../../sub.service';
import {isTrue} from '../../../../../../@core/utils/extend';

@Component({
  selector: 'app-sub-ticket-hall-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.scss'],
  providers: [DatePipe]
})
export class SubTicketHallSeatsComponent implements OnInit, AfterViewInit, OnDestroy {
  info;
  plan;
  @ViewChild('container', {static: false}) private container: ElementRef;
  seats;
  floors;
  regions = [];
  scale = 1; // 缩放比例
  subscribe;
  opened = false;
  sub: SubDto = {};

  constructor(private zone: NgZone,
              private modalController: ModalController,
              private route: ActivatedRoute,
              private router: Router,
              private cacheSvc: CacheService) {
  }

  ngOnInit() {
    this.subscribe = this.cacheSvc.getSubStatus().subscribe(res => {
      const sub = isTrue(res) ? res : {};
      if (!this.sub) {
        this.init(sub);
      }
      if (this.sub.updateTime !== sub.updateTime) {
        this.init(sub);
      }
    });
  }

  init(sub) {
    this.sub = sub;
    this.plan = this.sub.plan;
    this.info = this.sub.info;
    this.floors = this.sub.floors;
    this.regions = this.sub.regions;
    this.rendSeats(this.sub.seats);

    if (!this.opened && this.sub.open) {
      this.opened = true;
      this.presentPlansModal(this.sub).then();
    }
    if (this.opened && !this.sub.open) {
      this.modalController.dismiss().then(() => {
        this.opened = false;
      });
    }
  }

  async presentPlansModal(sub) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: SubPlansIndexPage,
      cssClass: 'full-modal',
      componentProps: {sub}
    });
    await modal.present();
  }

  ngAfterViewInit() {
    fromEvent(window, 'resize').subscribe((event) => {
      const most = getMost(this.seats);
      setTimeout(() => {
        this.scale = getScale(this.container, most);
      });
    });
  }

  rendSeats(seats) {
    const most = getMost(seats);
    this.scale = getScale(this.container, most);
    seats.forEach(seat => {
      seat.style = getStyle(seat, most);
    });
    this.seats = seats;
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
