import {Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {ToastService} from '../../../@theme/modules/toast';
import {ShoppingCartService} from '../../shopping-cart/shopping-cart.service';
import {AppService} from '../../../app.service';
import {AuthService} from '../../auth/auth.service';
import {TicketService} from '../ticket.service';

import {DatePipe} from '@angular/common';
import {RepairDatePipe} from '../../../@theme/pipes/pipes.pipe';
import {NgZone} from '@angular/core';

import {TicketHallComponent} from './components/hall/hall.component';
import {CacheService} from '../../../@core/utils/cache.service';
import {SubService} from '../../sub/sub.service';
import {MemberService} from '../../../@theme/modules/member/member.service';

@Component({
  selector: 'app-ticket-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [DatePipe]
})
export class TicketIndexPage implements OnInit, OnDestroy {
  isFullscreen = false;
  show = false;
  date = new Date();
  loading = false;
  didEnter = false;
  @ViewChild('hallComponent', {static: false}) private hallComponent: TicketHallComponent;
  plan;
  interval;
  subscribe: any = {};

  constructor(private route: ActivatedRoute,
              private zone: NgZone,
              private cdr: ChangeDetectorRef,
              private datePipe: DatePipe,
              private repairDatePipe: RepairDatePipe,
              private modalController: ModalController,
              private subSvc: SubService,
              private cacheSvc: CacheService,
              private toastSvc: ToastService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private memberSvc: MemberService,
              private shoppingCartSvc: ShoppingCartService,
              private ticketSvc: TicketService) {
    this.subscribe.fullscreenStatus = appSvc.fullscreenStatus.subscribe(res => {
      this.isFullscreen = res;
    });
    this.subscribe.getPlanStatus = ticketSvc.getPlanStatus().subscribe(res => {
      this.planChange(res);
    });
    this.subscribe.getDateStatus = ticketSvc.getDateStatus().subscribe(res => {
      if (res && this.date !== res) {
        this.date = res;
        const sub = this.subSvc.currentSub;
        sub.date = this.date;
        this.subSvc.updateSubStatus(sub);
        this.getPlans();
      }
    });
    this.getPlans();
  }

  ngOnInit() {
  }

  getPlans() {
    this.loading = true;
    this.ticketSvc.plans({
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidComp: this.appSvc.currentCinema.uidComp,
      planDate: this.datePipe.transform(this.date, 'yyyy-MM-dd')
    }).subscribe(res => {
      this.loading = false;
      const nowTimeStamp = new Date().getTime(); // 当前时间戳
      if (res.status.status === 0) {
        res.data.forEach(plan => {
          const posPlanValidTimeStamp = plan.posPlanValidTime ?
            new Date(this.repairDatePipe.transform(plan.posPlanValidTime)).getTime() :
            new Date(this.repairDatePipe.transform(plan.posStartTime)).getTime(); // 影片开始时间戳
          plan.expired = posPlanValidTimeStamp - nowTimeStamp <= 0;
        });
      }
      res.data.sort((a, b) => {
        return new Date(a.posStartTime).getTime() - new Date(b.posStartTime).getTime();
      });
      this.ticketSvc.updatePlansStatus(res.data);
      const sub = this.subSvc.currentSub;
      sub.plans = res.data;
      this.subSvc.updateSubStatus(sub);
    });
  }

  ionViewDidEnter() {
    this.didEnter = true;
  }

  ionViewDidLeave() {
    this.didEnter = false;
  }

  planChange(plan) {
    if (plan) { // 当前有排片
      if (!this.plan || (this.plan && this.plan.uidPlan !== plan.uidPlan)) {
        this.toastSvc.loading('', 0);
        this.ticketSvc.plan({
          terminalCode: this.authSvc.currentTerminalCode,
          uidComp: this.appSvc.currentCinema.uidComp,
          uidField: plan.uidHall,
          uidPlan: plan.uidPlan,
          uidPosShopCart: this.shoppingCartSvc.currentCart
        }).subscribe(res => {
          this.toastSvc.hide();
          const info = res.data;
          this.ticketSvc.updateInfoStatus(info);
        });
        this.updateCount(plan);
      }
    } else {// 当前没有排片，清空数据
      const info = null;
      this.ticketSvc.updateInfoStatus(info);
    }
    this.plan = plan;
  }

  updateCount(plan) {
    const member = this.memberSvc.currentMember;
    const card = this.memberSvc.currentCard;
    if (member && card) {
      const body = {
        uidCardLevel: card.uidCardLevel,
        cardno: card.cardNo,
        uidMemberCard: card.uidMemberCard,
        uidScene: plan.uidPlan,
      };
      this.memberSvc.count(body).subscribe(res => {
        card.totalSaleTicketCountToday = res.data.totalSaleTicketCountToday;
        card.curPosResourctTicketCount = res.data.curPosResourctTicketCount;
        card.cardParamEntityList = res.data.cardParamEntityList;
        member.card = card;
        this.memberSvc.updateMemberStatus(member);
        this.memberSvc.updateCardStatus(card);
      });
    }
  }

  reload() {
    this.getPlans();
  }

  ngOnDestroy() {
    for (const key in this.subscribe) {
      if (this.subscribe[key]) {
        this.subscribe[key].unsubscribe();
      }
    }
  }

}
