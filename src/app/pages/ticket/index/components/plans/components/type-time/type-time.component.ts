import {
  AfterViewInit, Component, ChangeDetectorRef,
  EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {IonContent} from '@ionic/angular';
import {AppService} from '../../../../../../../app.service';
import {AuthService} from '../../../../../../auth/auth.service';
import {TicketService} from '../../../../../ticket.service';
import {ShoppingCartService} from '../../../../../../shopping-cart/shopping-cart.service';
import {SnackbarService} from '../../../../../../../@core/utils/snackbar.service';
import {checkRedirect} from '../../../../../../../@core/utils/extend';
import {getPage, currentPageData} from '../../../../../../../@theme/modules/pagination/pagination.component';
import {groupPlans} from '../../../../../../../@core/utils/extend';

@Component({
  selector: 'app-ticket-plans-type-time',
  templateUrl: './type-time.component.html',
  styleUrls: ['./type-time.component.scss'],
  providers: [DatePipe]
})
export class TicketPlansTypeTimeComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() plans;
  @Input() loading;
  @Output() askForFull: EventEmitter<string> = new EventEmitter();
  plan = this.ticketSvc.currentPlan;
  page = {
    currentPage: 1,
    pageSize: 8
  };
  currentPageData = currentPageData;
  getPage = getPage;

  @ViewChild(IonContent) public content: any;
  height = 0;
  times;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plans && changes.plans.previousValue !== changes.plans.currentValue) {
      this.times = this.plans.filter(plan => {
        return !plan.expired;
      });
      this.page = getPage(this.times, this.page.pageSize);
      const uid = this.route.snapshot.queryParams.plan;
      let currentPlan;
      let targetPlan;
      if (uid) {
        targetPlan = this.times.filter(item => {
          return item.uidPlan === uid;
        })[0];
      }
      currentPlan = targetPlan || this.ticketSvc.currentPlan || this.times[0];
      this.ticketSvc.updatePlanStatus(currentPlan);
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

  prev() {
  }

  next() {
  }

  expand() {
    this.askForFull.next('time');
  }

  pageChange(e) {
    this.page = e;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
