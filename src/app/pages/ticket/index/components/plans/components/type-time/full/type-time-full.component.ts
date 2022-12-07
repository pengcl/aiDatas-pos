import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RepairDatePipe } from '../../../../../../../../@theme/pipes/pipes.pipe';
import { TicketService } from '../../../../../../ticket.service';
import { SubService } from '../../../../../../../sub/sub.service';
import { ShoppingCartService } from '../../../../../../../shopping-cart/shopping-cart.service';
import { SnackbarService } from '../../../../../../../../@core/utils/snackbar.service';
import { checkRedirect } from '../../../../../../../../@core/utils/extend';
import { getPage, currentPageData } from '../../../../../../../../@theme/modules/pagination/pagination.component';
import { IonContent } from '@ionic/angular';
import { fixPlans } from '../../../../../../../../@core/utils/extend';

const groupPlans = (plans, date, datePipe, repairDatePipe) => {
  const zero = new Date(datePipe.transform(date, 'yyyy/MM/dd 00:00:00')).getTime();
  const group = {
    '06:00-12:59': [],
    '13:00-16:59': [],
    '17:00-21:59': [],
    '22:00-05:59': []
  };
  plans.forEach(plan => {
    const dateTime = new Date(datePipe.transform(repairDatePipe.transform(plan.posStartTime), 'yyyy/MM/dd HH:mm:ss')).getTime();
    if (dateTime >= (zero + (6 * 3600000)) && dateTime < (zero + (13 * 3600000))) {
      group['06:00-12:59'].push(plan);
    }
    if (dateTime >= (zero + (13 * 3600000)) && dateTime < (zero + (17 * 3600000))) {
      group['13:00-16:59'].push(plan);
    }
    if (dateTime >= (zero + (17 * 3600000)) && dateTime < (zero + (22 * 3600000))) {
      group['17:00-21:59'].push(plan);
    }
    if (dateTime >= (zero + (22 * 3600000)) && dateTime < (zero + (30 * 3600000))) {
      if (dateTime > (zero + (24 * 3600000))) {
        plan.tag = '次日';
      }
      group['22:00-05:59'].push(plan);
    }
  });
  const groupArr = [];
  for (const key in group) {
    if (group[key].length > 0) {
      const need = (Math.ceil(group[key].length / 4) * 4) - group[key].length;
      for (let i = 0; i < need; i++) {
        group[key].push(null);
      }
      groupArr.push({label: key, plans: group[key]});
    }
  }
  return groupArr;
};

@Component({
  selector: 'app-ticket-plans-type-time-full',
  templateUrl: './type-time-full.component.html',
  styleUrls: ['./type-time-full.component.scss'],
  providers: [DatePipe, RepairDatePipe]
})
export class TicketPlansTypeTimeFullComponent implements AfterViewInit, OnChanges {
  @Input() plans;
  @Input() showCounts;
  @Input() date;
  @Output() askForDismiss: EventEmitter<string> = new EventEmitter();
  groupPlans;
  group;
  plan;
  page = {
    currentPage: 1,
    pageSize: 32
  };
  currentPageData = currentPageData;
  getPage = getPage;
  currentPlans;
  @ViewChild(IonContent) public content: any;

  constructor(private datePipe: DatePipe,
              private repairDatePipe: RepairDatePipe,
              private ticketSvc: TicketService,
              private subSvc: SubService,
              private shoppingCartSvc: ShoppingCartService,
              private snackbarSvc: SnackbarService) {
    ticketSvc.getPlanStatus().subscribe(res => {
      this.plan = res;
    });
  }

  ngAfterViewInit() {
  }

  getPlans() {
    const plans = [];
    this.groupPlans.forEach(hall => {
      for (let i = 0; i <= 7; i++) {
        if (hall.plans[i]) {
          plans.push(hall.plans[i]);
        } else {
          plans.push(null);
        }
      }
    });
    return plans;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plans && changes.plans.previousValue !== changes.plans.currentValue) {
      this.groupPlans = groupPlans(this.plans, this.date, this.datePipe, this.repairDatePipe);
      this.currentPlans = this.getPlans();
      this.page = getPage(this.currentPlans, this.page.pageSize);
      this.updateSubComponent();
    }
  }

  groupChange(group) {
    this.group = group;
    this.currentPlans = fixPlans(this.group.plans, 32);
    this.page = getPage(this.currentPlans, this.page.pageSize);
    this.updateSubComponent();
  }

  changePlan(plan) {
    if (!plan) {
      return false;
    }
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.error.seats) {
        this.snackbarSvc.show('您已经选择了座位，无法切换排期', 2000);
      } else {
        this.ticketSvc.updatePlanStatus(plan);
        this.askForDismiss.next('time');
      }
    });
  }

  updateSubComponent() {
    const component = {
      times: this.groupPlans,
      plans: this.currentPageData(this.currentPlans, this.page),
      time: this.group,
      page: this.page
    };
    this.subSvc.updateSubComponent('time', component);
  }

  expand() {
    this.askForDismiss.next();
  }

  pageChange(e) {
    this.page = e;
    this.updateSubComponent();
  }

}
