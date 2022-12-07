import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  AfterViewInit,
  OnChanges,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { fixPlans, groupPlans } from '../../../../../../../../@core/utils/extend';
import { TicketService } from '../../../../../../ticket.service';
import { SubService } from '../../../../../../../sub/sub.service';
import { ShoppingCartService } from '../../../../../../../shopping-cart/shopping-cart.service';
import { SnackbarService } from '../../../../../../../../@core/utils/snackbar.service';
import { checkRedirect } from '../../../../../../../../@core/utils/extend';
import { currentPageData, getPage } from '../../../../../../../../@theme/modules/pagination/pagination.component';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-ticket-plans-type-hall-full',
  templateUrl: './type-hall-full.component.html',
  styleUrls: ['./type-hall-full.component.scss'],
  providers: [DatePipe]
})
export class TicketPlansTypeHallFullComponent implements AfterViewInit, OnChanges {
  @Input() plans;
  @Input() showCounts;
  @Output() askForDismiss: EventEmitter<string> = new EventEmitter();
  hall;
  hallPlans;
  halls;
  plan = this.ticketSvc.currentPlan;
  page = {
    group: {
      currentPage: 1,
      pageSize: 4
    },
    items: {
      currentPage: 1,
      pageSize: 32
    }
  };
  currentPageData = currentPageData;
  getPage = getPage;

  @ViewChild(IonContent) public content: any;

  constructor(private ticketSvc: TicketService,
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
    const currentHalls = this.currentPageData(this.halls, this.page.group);
    currentHalls.forEach(hall => {
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
      this.initData();
      this.halls = groupPlans(this.plans, 'hall');
      this.page.group = getPage(this.halls, this.page.group.pageSize);
      this.hallPlans = this.getPlans();
      this.updateSubComponent();
    }
  }

  initData() {
    this.page.items.currentPage = 1;
    this.page.group.currentPage = 1;
    this.hall = null;
    this.plan = null;
    this.updateSubComponent();
  }

  changeHall(hall) {
    this.page.items.currentPage = 1;
    if (this.hall && hall.uidHall === this.hall.uidHall) {
      this.hall = null;
      this.hallPlans = this.getPlans();
    } else {
      this.hall = hall;
      this.hallPlans = fixPlans(this.hall.plans, this.page.items.pageSize);
      this.page.items = getPage(this.hallPlans, this.page.items.pageSize);
    }
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
        this.askForDismiss.next('hall');
      }
    });
  }

  expand() {
    this.askForDismiss.next();
  }

  updateSubComponent() {
    const component = {
      halls: this.currentPageData(this.halls, this.page.group),
      plans: this.currentPageData(this.hallPlans, this.page.items),
      hall: this.hall,
      page: this.page
    };
    this.subSvc.updateSubComponent('hall', component);
  }

  get type() {
    return this.hall ? 'items' : 'group';
  }

  pageChange(e) {
    this.page[this.type] = e;
    if (!this.hall) {
      this.hallPlans = this.getPlans();
    }
    this.updateSubComponent();
  }

}
