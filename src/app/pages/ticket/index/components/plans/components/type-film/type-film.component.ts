import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
  OnInit,
  OnDestroy,
  AfterViewInit,
  OnChanges
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {groupPlans, fixPlans} from '../../../../../../../@core/utils/extend';
import {SnackbarService} from '../../../../../../../@core/utils/snackbar.service';
import {AppService} from '../../../../../../../app.service';
import {AuthService} from '../../../../../../auth/auth.service';
import {ShoppingCartService} from '../../../../../../shopping-cart/shopping-cart.service';
import {TicketService} from '../../../../../ticket.service';
import {checkRedirect} from '../../../../../../../@core/utils/extend';
import {currentPageData, getPage} from '../../../../../../../@theme/modules/pagination/pagination.component';
import {IonContent} from '@ionic/angular';

@Component({
  selector: 'app-ticket-plans-type-film',
  templateUrl: './type-film.component.html',
  styleUrls: ['./type-film.component.scss']
})
export class TicketPlansTypeFilmComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() plans;
  @Input() loading;
  @Output() askForFull: EventEmitter<string> = new EventEmitter();
  film;
  filmPlans;
  films;
  plan = this.ticketSvc.currentPlan;

  page = {
    group: {
      currentPage: 1,
      pageSize: 8
    },
    items: {
      currentPage: 1,
      pageSize: 16
    }
  };
  currentPageData = currentPageData;
  getPage = getPage;

  @ViewChild(IonContent) public content: any;
  height = 0;
  subscribe;

  constructor(private route: ActivatedRoute,
              private snackbarSvc: SnackbarService,
              private appSvc: AppService,
              public authSvc: AuthService,
              private ticketSvc: TicketService,
              private shoppingCartSvc: ShoppingCartService) {
  }

  ngOnInit() {
    this.subscribe = this.ticketSvc.getPlanStatus().subscribe(res => {
      this.plan = res;
    });
  }

  ngAfterViewInit() {
  }

  getPlans() {
    const plans = [];
    const currentFilms = this.currentPageData(this.films, this.page.group);
    currentFilms.forEach(film => {
      for (let i = 0; i <= 1; i++) {
        if (film.plans[i]) {
          plans.push(film.plans[i]);
        } else {
          plans.push('');
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
      this.films = groupPlans(plans, 'film');
      this.page.group = getPage(this.films, this.page.group.pageSize);
      this.filmPlans = this.getPlans();
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
    }
  }

  initData() {
    this.page.items.currentPage = 1;
    this.page.group.currentPage = 1;
    this.film = null;
    this.plan = null;
  }

  changeFilm(film) {
    this.page.items.currentPage = 1;
    if (this.film && film.id === this.film.id) {
      this.film = null;
      this.filmPlans = this.getPlans();
    } else {
      this.film = film;
      this.filmPlans = fixPlans(this.film.plans, 16);
      this.page.items = getPage(this.filmPlans, this.page.items.pageSize);
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

  get type() {
    return this.film ? 'items' : 'group';
  }

  expand() {
    this.askForFull.next('film');
  }

  pageChange(e) {
    this.page[this.type] = e;
    if (!this.film) {
      this.filmPlans = this.getPlans();
    }
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
