import {
  Component, EventEmitter, Input, Output, ChangeDetectorRef,
  SimpleChanges, OnInit, OnDestroy, AfterViewInit, OnChanges, ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {fixPlans, groupPlans} from '../../../../../../../@core/utils/extend';
import {AppService} from '../../../../../../../app.service';
import {AuthService} from '../../../../../../auth/auth.service';
import {TicketService} from '../../../../../ticket.service';
import {ShoppingCartService} from '../../../../../../shopping-cart/shopping-cart.service';
import {SnackbarService} from '../../../../../../../@core/utils/snackbar.service';
import {checkRedirect} from '../../../../../../../@core/utils/extend';
import {currentPageData, getPage} from '../../../../../../../@theme/modules/pagination/pagination.component';
import {IonContent} from '@ionic/angular';

@Component({
  selector: 'app-ticket-plans-type-hall',
  templateUrl: './type-hall.component.html',
  styleUrls: ['./type-hall.component.scss'],
  providers: [DatePipe]
})
export class TicketPlansTypeHallComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() plans;
  @Input() loading;
  @Output() askForFull: EventEmitter<string> = new EventEmitter();
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
      pageSize: 8
    }
  };
  currentPageData = currentPageData;
  getPage = getPage;

  @ViewChild(IonContent) public content: any;
  height = 0;
  subscribe;

  constructor(private cdr: ChangeDetectorRef,
              private route: ActivatedRoute,
              private appSvc: AppService,
              public authSvc: AuthService,
              private ticketSvc: TicketService,
              private shoppingCartSvc: ShoppingCartService,
              private snackbarSvc: SnackbarService) {
  }

  ngOnInit() {
    this.subscribe = this.ticketSvc.getPlanStatus().subscribe(res => {
      this.plan = res;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.height = this.content.el.offsetHeight;
    }, 100);
  }

  getPlans() {
    const plans = [];
    const currentHalls = this.currentPageData(this.halls, this.page.group);
    currentHalls.forEach(hall => {
      for (let i = 0; i <= 1; i++) {
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
      const plans = this.plans.filter(plan => {
        return !plan.expired;
      });
      this.halls = groupPlans(plans, 'hall');
      this.page.group = getPage(this.halls, this.page.group.pageSize);
      this.hallPlans = this.getPlans();
      const uid = this.route.snapshot.queryParams.plan;
      let currentPlan;
      let targetPlan;
      if (uid) {
        targetPlan = plans.filter(item => {
          return item.uidPlan === uid;
        })[0];
      }
      currentPlan = targetPlan || this.ticketSvc.currentPlan || plans[0];
      this.ticketSvc.updatePlanStatus(currentPlan);
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  initData() {
    this.page.items.currentPage = 1;
    this.page.group.currentPage = 1;
    this.hall = null;
    this.plan = null;
  }

  changeHall(hall) {
    this.page.items.currentPage = 1;
    if (this.hall && hall.uidHall === this.hall.uidHall) {
      this.hall = null;
      this.hallPlans = this.getPlans();
    } else {
      this.hall = hall;
      this.hallPlans = fixPlans(this.hall.plans, 8);
      this.page.items = getPage(this.hallPlans, this.page.items.pageSize);
    }
  }

  changePlan(plan) {
    if (this.appSvc.currentLoading) {
      return false;
    }
    if (!plan) {
      return false;
    }
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.error.seats) {
        this.snackbarSvc.show('您已经选择了座位，无法切换排期', 2000);
      } else {
        this.ticketSvc.updatePlanStatus(plan);
      }
    });
  }

  expand() {
    this.askForFull.next('hall');
  }

  get type() {
    return this.hall ? 'items' : 'group';
  }

  pageChange(e) {
    this.page[this.type] = e;
    if (!this.hall) {
      this.hallPlans = this.getPlans();
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
