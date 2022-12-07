import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
  AfterViewInit,
  OnChanges
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { groupPlans, fixPlans } from '../../../../../../../../@core/utils/extend';
import { SnackbarService } from '../../../../../../../../@core/utils/snackbar.service';
import { ShoppingCartService } from '../../../../../../../shopping-cart/shopping-cart.service';
import { TicketService } from '../../../../../../ticket.service';
import { SubService } from '../../../../../../../sub/sub.service';
import { checkRedirect } from '../../../../../../../../@core/utils/extend';
import { getPage, currentPageData } from '../../../../../../../../@theme/modules/pagination/pagination.component';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-ticket-plans-type-film-full',
  templateUrl: './type-film-full.component.html',
  styleUrls: ['./type-film-full.component.scss'],
  providers: [DatePipe]
})
export class TicketPlansTypeFilmFullComponent implements AfterViewInit, OnChanges {
  @Input() plans;
  @Input() showCounts;
  @Output() askForDismiss: EventEmitter<string> = new EventEmitter();
  film;
  filmPlans;
  films;
  plan = this.ticketSvc.currentPlan;

  liHeight = 0;

  page = {
    group: {
      currentPage: 1,
      pageSize: 4
    },
    items: {
      currentPage: 1,
      pageSize: 40
    }
  };
  currentPageData = currentPageData;

  @ViewChild(IonContent) public content: any;
  height;

  constructor(private snackbarSvc: SnackbarService,
              private ticketSvc: TicketService,
              private subSvc: SubService,
              private shoppingCartSvc: ShoppingCartService) {
    ticketSvc.getPlanStatus().subscribe(res => {
      this.plan = res;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.height = this.content.el.offsetHeight - 58;
      this.liHeight = (this.height / 8);
    });
  }

  getPlans() {
    const plans = [];
    const currentFilms = currentPageData(this.films, this.page.group);
    currentFilms.forEach(film => {
      for (let i = 0; i <= 9; i++) {
        if (film.plans[i]) {
          plans.push(film.plans[i]);
        } else {
          plans.push(null);
        }
      }
    });
    return plans;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plans && changes.plans.previousValue !== changes.plans.currentValue) {
      this.getData();
    }
  }

  getData() {
    this.initData();
    this.films = groupPlans(this.plans, 'film');
    this.page.group = getPage(this.films, this.page.group.pageSize);
    this.filmPlans = this.getPlans();
    this.updateSubComponent();
  }

  initData() {
    this.page.items.currentPage = 1;
    this.page.group.currentPage = 1;
    this.film = null;
    this.plan = null;
    this.updateSubComponent();
  }

  changeFilm(film) {
    this.page.items.currentPage = 1;
    if (this.film && film.id === this.film.id) {
      this.film = null;
      this.filmPlans = this.getPlans();
    } else {
      this.film = film;
      this.filmPlans = fixPlans(this.film.plans, this.page.items.pageSize);
      this.page.items = getPage(this.filmPlans, this.page.items.pageSize);
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
        this.askForDismiss.next('film');
      }
    });
  }

  get type() {
    return this.film ? 'items' : 'group';
  }

  expand() {
    this.askForDismiss.next();
  }

  updateSubComponent() {
    const component = {
      films: this.currentPageData(this.films, this.page.group),
      plans: this.currentPageData(this.filmPlans, this.page.items),
      film: this.film,
      page: this.page
    };
    this.subSvc.updateSubComponent('film', component);
  }

  pageChange(e) {
    this.page[this.type] = e;

    if (!this.film) {
      this.filmPlans = this.getPlans();
    }
    this.updateSubComponent();
  }

}
