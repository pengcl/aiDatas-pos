import {
  Component
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { SnackbarService } from '../../../../../../@core/utils/snackbar.service';
import { TicketService } from '../../../../ticket.service';
import { SubService } from '../../../../../sub/sub.service';
import { AppService } from '../../../../../../app.service';
import { ShoppingCartService } from '../../../../../shopping-cart/shopping-cart.service';
import { DatePipe } from '@angular/common';
import { checkRedirect } from '../../../../../../@core/utils/extend';
import { RepairDatePipe } from '../../../../../../@theme/pipes/pipes.pipe';

@Component({
  selector: 'app-ticket-plans-full',
  templateUrl: './plans-full.component.html',
  styleUrls: ['./plans-full.component.scss'],
  providers: [DatePipe, RepairDatePipe]
})
export class TicketPlansFullComponent {
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

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalController: ModalController,
              private navParams: NavParams,
              private snackbarSvc: SnackbarService,
              private datePipe: DatePipe,
              private repairDatePipe: RepairDatePipe,
              private appSvc: AppService,
              private subSvc: SubService,
              private ticketSvc: TicketService,
              private shoppingCartSvc: ShoppingCartService) {
    this.type = navParams.data.type;
    this.form.get('date').setValue(navParams.data.date);
    this.updatePlans();
  }

  getPlans() {
    const data = {
      planDate: this.form.get('date').value,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.ticketSvc.plans(data).subscribe(res => {
      const nowTimeStamp = new Date().getTime(); // 当前时间戳
      if (res.status.status === 0) {
        res.data.forEach(plan => {
          const posPlanValidTimeStamp = new Date(this.repairDatePipe.transform(plan.posPlanValidTime)).getTime(); // 影片开始时间戳
          plan.expired = posPlanValidTimeStamp - nowTimeStamp <= 0;
        });
      }
      res.data.sort((a, b) => {
        return new Date(a.posStartTime).getTime() - new Date(b.posStartTime).getTime();
      });
      this.sourcePlans = res.data;
      this.subSvc.updateSub('plans', this.sourcePlans);
      this.updatePlans();
    });
  }

  check(target) {
    this[target] = !this[target];
    this.updatePlans(target);
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
        this.ticketSvc.counts(uidS).subscribe(res => {
          plans.forEach(plan => {
            plan.views = res.data[plan.uidPlan][0];
            plan.rate = res.data[plan.uidPlan][1];
            plan.total = res.data[plan.uidPlan][2];
          });
        });
      }
    }
    this.plans = plans;
  }

  prev() {
    const timeStamp = new Date(this.form.get('date').value).getTime() - 24 * 60 * 60 * 1000;
    this.changeDate(timeStamp);
  }

  next() {
    const timeStamp = new Date(this.form.get('date').value).getTime() + 24 * 60 * 60 * 1000;
    this.changeDate(timeStamp);
  }

  changeDate(timeStamp) {
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.error.seats) {
        this.snackbarSvc.show('您已经选择了座位，无法切换排期', 2000);
      } else {
        this.form.get('date').setValue(this.datePipe.transform(new Date(timeStamp), 'yyyy-MM-dd'));
        this.subSvc.updateSub('date', this.form.get('date').value);
        this.getPlans();
      }
    });
  }

  dateChange(e) {
    const timeStamp = new Date(e.value).getTime();
    this.changeDate(timeStamp);
  }

  segmentChange(e) {
    this.subSvc.updateSub('type', e.detail.value);
  }

  // todo:askForReload
  reload() {
    // this.getData();
  }

  dismiss(e) {
    if (e) {
      this.ticketSvc.updateDateStatus(this.form.get('date').value);
    }
    this.modalController.dismiss(e).then();
  }

}
