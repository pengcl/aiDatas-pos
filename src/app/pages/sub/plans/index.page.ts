import {
  Component, OnDestroy
} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController, NavParams} from '@ionic/angular';
import {TicketService} from '../../ticket/ticket.service';
import {AppService} from '../../../app.service';
import {CacheService} from '../../../@core/utils/cache.service';
import {DatePipe} from '@angular/common';
import {interval as observableInterval} from 'rxjs/internal/observable/interval';
import {isTrue} from '../../../@core/utils/extend';

@Component({
  selector: 'app-sub-plans-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [DatePipe]
})
export class SubPlansIndexPage implements OnDestroy {
  type = 'time';
  cinema = this.appSvc.currentCinema;
  plans;
  plan;
  form: FormGroup = new FormGroup({
    date: new FormControl(new Date(), [Validators.required])
  });
  showDisabled = true;
  showCounts = false;
  sourcePlans = this.ticketSvc.currentPlans;
  sub;
  subscribe;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalController: ModalController,
              private navParams: NavParams,
              private datePipe: DatePipe,
              private cacheSvc: CacheService,
              private appSvc: AppService,
              private ticketSvc: TicketService) {
    this.init(navParams.data.sub);
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

  init(sub){
    this.sub = sub;
    this.type = this.sub.type;
    this.form.get('date').setValue(this.sub.date);
    this.sourcePlans = this.sub.plans;
    this.updatePlans();
  }

  updatePlans(target?) {
    let plans;
    if (target === 'showDisabled') {
      if (!this.showDisabled) {
        plans = this.sourcePlans.filter(plan => {
          return !plan.expired;
        });
      } else {
        plans = this.sourcePlans;
      }
    } else {
      if (!this.showDisabled) {
        plans = this.sourcePlans.filter(plan => {
          return !plan.expired;
        });
      } else {
        plans = this.sourcePlans;
      }
      if (this.showCounts) {
        const uidS = [];
        this.sourcePlans.forEach(plan => {
          uidS.push(plan.uidPlan);
        });
      }
    }
    this.plans = plans;
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
