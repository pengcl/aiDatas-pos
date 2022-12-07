import {Component, OnInit, OnDestroy} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  NavigationExtras
} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {CacheService} from '../../@core/utils/cache.service';
import {ToastService} from '../../@theme/modules/toast';
import {AppService} from '../../app.service';
import {SubService} from '../../pages/sub/sub.service';
import {AuthService} from '../../pages/auth/auth.service';
import {MemberService} from '../../@theme/modules/member/member.service';
import {TicketService} from '../../pages/ticket/ticket.service';
import {ShoppingCartService} from '../../pages/shopping-cart/shopping-cart.service';
import {interval as observerInterval} from 'rxjs';
import {TimerComponent} from '../../@theme/entryComponents/timer/timer.component';
import {SeatsService} from '../../pages/ticket/index/components/hall/components/seats/seats.service';
import {interval as observeInterval} from 'rxjs/internal/observable/interval';
import {debounce, debounceTime} from 'rxjs/operators';

@Component({
  selector: 'layout-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class LayoutPagesComponent implements OnInit, OnDestroy {
  cinema = this.appSvc.currentCinema;
  terminalCode = this.authSvc.currentTerminalCode;
  user = this.authSvc.currentUser;
  staff = this.authSvc.currentStaff;
  isFullscreen = false;
  date = new Date();
  plan;
  isOpen = false;
  interval;
  isCheckout = false;
  subscribe: any = {};
  loading = false;
  askTimes = 0; // 第一次获取座位图无需刷新座位图

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private cacheSvc: CacheService,
              private appSvc: AppService,
              private subSvc: SubService,
              private authSvc: AuthService,
              private memberSvc: MemberService,
              private shoppingCartSvc: ShoppingCartService,
              private ticketSvc: TicketService,
              private seatsSvc: SeatsService) {
    this.subscribe.router = router.events
    .subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.toastSvc.loading('', 0);
      }
      if (event instanceof NavigationCancel) {
        this.toastSvc.hide();
        // this.toastSvc.loading('', 0);
      }
      if (event instanceof NavigationError) {
        this.toastSvc.hide();
        // this.toastSvc.loading('', 0);
      }
      if (event instanceof NavigationEnd) { // 当导航成功结束时执行
        this.toastSvc.hide();
        this.isCheckout = event.url.indexOf('/checkout/index') !== -1 || event.url.indexOf('/vip/index?cardNo=') !== -1;
        if (event.url.indexOf('/checkout') !== -1) {
          if (this.subscribe.interval) {
            this.subscribe.interval.unsubscribe();
          }
          this.subSvc.updateSub('page', 'checkout');
        } else if (event.url.indexOf('/ticket') !== -1) {
          if (!this.subscribe.interval || this.subscribe.interval.closed) {
            this.subscribe.interval = observeInterval(5000).subscribe(() => {
              if (!this.loading) {
                this.checkDatabase();
              }
            });
          }
          this.subSvc.updateSub('page', 'ticket');
        } else {
          if (this.subscribe.interval) {
            this.subscribe.interval.unsubscribe();
          }
          this.subSvc.updateSub('page', 'sleeping');
        }
      }
    });
    this.subscribe.loadingStatus = this.appSvc.getLoadingStatus().subscribe(res => {
      this.loading = res;
      if (this.subscribe.refresh && !this.subscribe.refresh.closed) {
        this.subscribe.refresh.unsubscribe();
      }
    });
    this.subscribe.refreshStatus = this.seatsSvc.getRefreshingStatus().subscribe(res => {
      if (res && this.subscribe.refresh) {
        this.subscribe.refresh.unsubscribe();
      }
    });
    this.subscribe.fullscreenStatus = this.appSvc.fullscreenStatus.subscribe(res => {
      this.isFullscreen = res;
    });
    this.subscribe.loginStatus = authSvc.getLoginStatus().subscribe(res => {
      this.cinema = this.appSvc.currentCinema;
      this.terminalCode = this.authSvc.currentTerminalCode;
      this.user = this.authSvc.currentUser;
    });
    this.subscribe.planStatus = ticketSvc.getPlanStatus().subscribe(res => {
      if (res && this.plan && res.uidPlan !== this.plan.uidPlan) {
        this.askTimes = 0;
      }
      this.plan = res;
    });
    this.subscribe.dateStatus = observerInterval(1000).subscribe(() => {
      this.date = new Date();
    });
    this.subscribe.getSubStatus = subSvc.getSubStatus().pipe(debounceTime(1000)).subscribe(res => {
      res.updateTime = new Date().getTime().toString();
      res.cinemaCode = this.appSvc.currentCinema.cinemaCode;
      res.terminalCode = this.authSvc.currentTerminalCode;
      this.cacheSvc.set('sub', JSON.stringify(res));
    });
    this.subscribe.getMemberStatus = this.memberSvc.getMemberStatus().subscribe(res => {
      this.subSvc.updateSub('member', res);
    });
  }

  ngOnInit() {
  }

  checkDatabase() {
    if (!this.plan) {
      return false;
    }
    this.ticketSvc.checkDatabase(this.plan.uidPlan).subscribe(res => {
      const releaseTime = this.ticketSvc.currentReleaseTime;
      const selected = this.ticketSvc.currentSelected;
      const seats = [];
      for (const key in selected) {
        if (selected[key]) {
          seats.push(selected[key]);
        }
      }
      if (releaseTime && seats.length > 0) {
        const databaseTime = new Date(res.data.databaseTime).getTime();
        const scheduler = releaseTime - databaseTime;
        if (scheduler <= 70000) {
          if (this.isCheckout) {
            this.delay();
          } else {
            if (!this.isOpen) {
              this.isOpen = true;
              this.openTimerModal(59).then();
            }
          }
        }
        /*if (releaseTime - databaseTime <= 10) {
          this.deletes();
        }*/
      }
      if (res.data.resTimeInt !== this.ticketSvc.currentTime) {
        this.ticketSvc.updateTime(res.data.resTimeInt);
        this.askTimes = this.askTimes + 1;
        if (!this.loading) {
          this.refresh();
        }
      }
    });
  }

  // 倒计时
  async openTimerModal(scheduler) {
    const params = {
      scheduler
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TimerComponent,
      componentProps: {params},
      cssClass: 'timer-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss();
    this.isOpen = false;
    if (data) {
      this.delay();
    } else {
      this.deletes();
    }
  }

  delay() {
    this.seatsSvc.delay().subscribe(res => {
      this.ticketSvc.updateReleaseTime(new Date(res.data.cartValidTime).getTime());
    });
  }

  deletes() {// 解除锁座
    if (this.appSvc.currentLoading) {
      return false;
    }
    this.toastSvc.loading('加载中...', 0);
    this.shoppingCartSvc.unlocks().subscribe(res => {
      if (res.status && res.status.status === 0) {
        this.ticketSvc.updateSelectedStatus({});
        this.refresh();
      }
    });
  }

  /*deletes() {// 解除销座
    if (this.appSvc.currentLoading) {
      return false;
    }
    const seatCodeList = [];
    for (const key in this.selected) {
      if (this.selected[key]) {
        seatCodeList.push(this.selected[key].resSeatCode);
      }
    }
    this.toastSvc.loading('加载中...', 0);
    this.shoppingCartSvc.unlocks().subscribe(res => {
      if (res.status && res.status.status === 0) {
        this.selected = {};
        // this.createBlankShoppingCart();
      }
      this.ticketSvc.updateSelectedStatus(this.selected);
      this.ticketHallSeatsComponent.refresh();
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }*/

  refresh() {// 刷新座位
    if (!this.plan) {
      return false;
    }
    if (this.askTimes <= 1) {
      return false;
    }
    this.seatsSvc.updateRefreshingStatus(true);
    this.subscribe.refresh = this.seatsSvc.refresh({
      terminalCode: this.authSvc.currentTerminalCode,
      uidComp: this.cinema.uidComp,
      uidField: this.plan.uidHall,
      uidPlan: this.plan.uidPlan,
      uidPosShopCart: this.shoppingCartSvc.currentCart
    }).subscribe(res => {
      // 同步座位图到info中 start
      const info = this.ticketSvc.currentInfo;
      info.seatList = res.data.seatList;
      this.ticketSvc.updateInfoStatus(info, true);
      // end

      this.seatsSvc.updateRefreshingStatus(false);
      this.toastSvc.hide();
      const seats = [];
      res.data.seatList.forEach(seat => {
        if ((seat.resSeatReserve === 1 || seat.resSeatReserve === 2) && seat.isOwned) {
          seats.push(seat);
        }
      });
      // this.ticketSvc.addSelected(seats);
      if (!this.loading) {
        this.appSvc.updateRenderStatus(res.data.seatList);
      }
    });
  }

  ngOnDestroy() {
    for (const key in this.subscribe) {
      if (this.subscribe[key]) {
        this.subscribe[key].unsubscribe();
      }
    }
  }
}
