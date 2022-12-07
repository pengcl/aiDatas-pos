import {
  Component,
  ChangeDetectorRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TicketHallBookComponent } from './components/book/book.component';
import { TicketHallSeatsComponent } from './components/seats/seats.component';
import { MemberComponent } from '../../../../../@theme/modules/member/member.component';
import { ToastService } from '../../../../../@theme/modules/toast';
import { NgZone } from '@angular/core';
import {
  ShoppingCartService,
  AddItemsInputDto,
  SubmitItemsInputDto
} from '../../../../shopping-cart/shopping-cart.service';
import { SnackbarService } from '../../../../../@core/utils/snackbar.service';
import { AppService } from '../../../../../app.service';
import { AuthService } from '../../../../auth/auth.service';
import { SubService } from '../../../../sub/sub.service';
import { TicketService } from '../../../ticket.service';
import { MemberService } from '../../../../../@theme/modules/member/member.service';
import { BookService, CreateBookInputDto } from './components/book/book.service';
import { checkRedirect, objectToArray } from '../../../../../@core/utils/extend';
import { IsOptionalPipe } from '../../../../../@theme/pipes/pipes.pipe';
import { setTicketType } from '../../../../../@core/utils/extend';
import { isNeedMember } from './components/seats/seats.extend';

@Component({
  selector: 'app-ticket-hall',
  templateUrl: './hall.component.html',
  styleUrls: ['./hall.component.scss'],
  providers: [IsOptionalPipe]
})
export class TicketHallComponent implements OnDestroy {
  @Input() didEnter;
  @Input() ticketTypes;
  plan = this.ticketSvc.currentPlan;
  info = this.ticketSvc.currentInfo;
  selected = this.ticketSvc.currentSelected;
  member;
  counts = [];
  data = {
    plan: null,
    seats: [],
    data: null
  };
  @ViewChild('seats', {static: true}) public ticketHallSeatsComponent: TicketHallSeatsComponent;
  @ViewChild('memberComponent', {static: true}) public memberComponent: MemberComponent;
  isFullscreen = false;
  currentRotate = false;
  @Output() rotate = new EventEmitter();
  subscribe: any = {};
  memberLock = false;

  constructor(private route: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private zone: NgZone,
              private snackbarSvc: SnackbarService,
              private isOptionalPipe: IsOptionalPipe,
              private modalController: ModalController,
              public authSvc: AuthService,
              private appSvc: AppService,
              private subSvc: SubService,
              private toastSvc: ToastService,
              private memberSvc: MemberService,
              private shoppingCartSvc: ShoppingCartService,
              private ticketSvc: TicketService,
              private bookSvc: BookService) {
    this.subscribe.getMemberStatus = this.memberSvc.getMemberStatus().subscribe(res => {
      this.member = res;
      const selected = setTicketType(this.ticketSvc.currentSelected, this.ticketSvc.currentInfo, this.member, this.isOptionalPipe);
      this.ticketSvc.updateSelectedStatus(selected);
    });
    this.subscribe.getPlanStatus = ticketSvc.getPlanStatus().subscribe(res => {
      this.plan = res;
    });
    this.subscribe.getInfoStatus = ticketSvc.getInfoStatus().subscribe(res => {
      this.info = res;
      if (this.info) {
        const seats = [];
        this.info.seatList.forEach(seat => {
          if ((seat.resSeatReserve === 1 || seat.resSeatReserve === 2) && seat.isOwned) {
            seats.push(seat);
          }
        });
        this.ticketSvc.addSelected(seats);
      }
    });
    this.subscribe.getSelectedStatus = ticketSvc.getSelectedStatus().subscribe(res => {
      // console.log(res);
      this.selected = res;
      const seats = [];
      let memberLock = false;
      for (const uid in res) {
        if (res[uid]) {
          seats.push(uid);
          if (isNeedMember(res[uid], this.ticketSvc.currentRegions, this.plan)) {
            memberLock = true;
          }
        }
      }
      this.memberLock = memberLock;
      if (seats.length === 0) {
        this.ticketSvc.updateReleaseTime(null);
      }
    });
    this.subscribe.getForceFreshStatus = ticketSvc.getForceFreshStatus().subscribe(res => {
      if (res) {
        this.selected = {};
        this.ticketSvc.updateSelectedStatus(this.selected);
        if (this.ticketHallSeatsComponent) {
          this.ticketHallSeatsComponent.refresh();
        }
        this.createBlankShoppingCart();
      }
    });
  }

  expand() {
    this.isFullscreen = !this.isFullscreen;
    this.appSvc.updateFullscreenStatus(this.isFullscreen);
  }

  setRotate() {
    this.currentRotate = !this.currentRotate;
    this.rotate.next(this.currentRotate);
  }

  countsChange(counts) {
    this.counts = counts;
  }

  select(seats) {
    const selected = [];
    const deselected = [];
    const ticketType = this.ticketSvc.currentTicketType;
    seats.forEach(seat => {
      if (!this.selected[seat.uid]) {
        seat.ticketType = ticketType;
        seat.levelPrice = seat.ticketType.levelPriceDTO.filter(item => {
          return seat.resSeatLevelCode === item.seatLevelCode;
        })[0];
        this.selected[seat.uid] = seat;
        selected.push(seat);
      } else {
        this.selected[seat.uid] = false;
        deselected.push(seat);
      }
    });
    // todo:很可疑
    this.ticketSvc.updateSelectedStatus(this.selected);
    if (selected.length > 0) {
      this.add(selected);
    }
    if (deselected.length > 0) {
      const isMouseSelected = deselected.filter(item => item.mouseSelected).length > 0;
      if (!isMouseSelected) {// 非框选
        this.delete(deselected);
      } else {
        deselected.forEach(item => {
          item.loading = false;
          this.selected[item.uid] = item;
        });
      }
    }
  }

  get selectedLength() {
    const selectedArray = objectToArray(this.selected);
    return selectedArray.length;
  }

  async presentBookModal() {
    this.data.plan = this.plan;
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TicketHallBookComponent,
      componentProps: this.data
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.pay(data);
    }
  }

  createAddItemInputDto(seats): AddItemsInputDto {
    return this.shoppingCartSvc.creatShoppingCartInputDto(seats);
  }

  createSubmitItemInputDto(seats): SubmitItemsInputDto {
    return this.shoppingCartSvc.creatShoppingCartInputDto(seats);
  }

  setLoadingStatus(seats, status) {
    seats.forEach(item => {
      item.loading = status;
    });
  }

  add(seats) {// 锁座
    const ticketType = this.ticketSvc.currentTicketType;
    if (ticketType) { // 当有选择票券时才执行
      const dto = this.createAddItemInputDto(seats);
      // this.toastSvc.loading('加载中...', 0);
      this.appSvc.updateLoadingStatus(true);
      this.setLoadingStatus(seats, true);
      this.shoppingCartSvc.add(dto).subscribe(res => {
        this.setLoadingStatus(seats, false);
        this.appSvc.updateLoadingStatus(false);
        if (res.status.status !== 0) {
          seats.forEach(seat => {
            this.selected[seat.uid] = false;
          });
          this.ticketHallSeatsComponent.refresh();
        } else {
          seats.forEach(seat => {
            seat.resSeatReserve = 1;
            seat.isOwned = 1;
          });
          this.ticketSvc.updateReleaseTime(new Date(res.data.cartReleaseTime).getTime());
        }
        this.ticketSvc.updateSelectedStatus(this.selected);
        // this.ticketHallSeatsComponent.refresh();
      });
    }
  }

  delete(seats) {// 解除销座
    // const seatCodeList = [];
    seats.forEach(seat => {
      // seatCodeList.push(seat.resSeatCode);
      // todo:不支持批量删除；
      // this.toastSvc.loading('加载中...', 0);
      this.setLoadingStatus(seats, true);
      this.appSvc.updateLoadingStatus(true);
      this.shoppingCartSvc.del({
        resType: 1,
        seatCodeList: [seat.resSeatCode],
        uidResource: seat.uid,
        uidResourcePlan: this.info.uidResource,
        uidShopCart: this.shoppingCartSvc.currentCart
      }).subscribe(res => {
        this.setLoadingStatus(seats, false);
        this.appSvc.updateLoadingStatus(false);
        if (res.status.status !== 0) {
          seats.forEach(item => {
            this.selected[seat.uid] = item;
          });
          this.ticketHallSeatsComponent.refresh();
        } else {
          seats.forEach(item => {
            item.resSeatReserve = 0;
            item.isOwned = 0;
          });
          // this.ticketSvc.updateReleaseTime(new Date(res.data.cartReleaseTime).getTime());
        }
        this.ticketSvc.updateSelectedStatus(this.selected);
        // this.ticketHallSeatsComponent.refresh();
      });
    });
  }

  deletes() {// 解除销座
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
  }

  handleSubmit() {
    this.toastSvc.loading('正在处理...', 20000);
    const inputDto = this.createSubmitItemInputDto(this.data.seats);
    this.shoppingCartSvc.submit(inputDto).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.data.data = res.data;
        this.presentBookModal().then();
      }
    });
  }

  submit() {
    if (this.appSvc.currentLoading) {
      return false;
    }
    this.data.seats = [];
    for (const uid in this.selected) {
      if (this.selected[uid]) {
        this.data.seats.push(this.selected[uid]);
      }
    }
    if (this.data.seats.length > 0) {
      checkRedirect(this.shoppingCartSvc).then(res => {
        if (res.status) {
          this.handleSubmit();
        } else {
          if (res.error.products || res.error.points || res.error.coupons) {
            this.snackbarSvc.show('当前购物车存在已选座位或商品，请清空后再试！', 2000);
          } else {
            this.handleSubmit();
          }
        }
      });
    } else {
      return false;
    }
  }


  pay(data) { // 预订
    const inputDto: CreateBookInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      isReleaseLock: data.isReleaseLockMm ? 1 : 0,
      reserveMemoryNum: data.reserveMemoryNum,
      isReleaseLockMm: data.isReleaseLockMm,
      reserveRemark: data.reserveRemark,
      terminalCode: this.authSvc.currentTerminalCode,
      uidComp: this.appSvc.currentCinema.uidComp,
      uidShopCart: this.shoppingCartSvc.currentCart
    };
    this.toastSvc.loading('预订中...', 0);
    this.bookSvc.create(inputDto).subscribe(res => {
      if (res.status.status === 0) {
        this.selected = {};
        this.ticketSvc.updateSelectedStatus(this.selected);
        this.createBlankShoppingCart(() => {
          this.memberSvc.updateMemberStatus(null);
          this.memberSvc.updateCardStatus(null);
          this.ticketHallSeatsComponent.refresh();
          this.cdr.markForCheck();
          this.cdr.detectChanges();

        });
      }
    });
  }

  createBlankShoppingCart(callback?) {
    this.shoppingCartSvc.createEmptyCart().then(() => {
      if (callback) {
        callback();
      }
    });
  }

  open() {
    const url = location.origin + '/sub/ticket';
    const aidaShell = (window as any).aidaShell;
    this.subSvc.updateSub('page', 'ticket');
    if (aidaShell) {
      aidaShell.setSlaveScreenUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }

  ngOnDestroy() {
    for (const key in this.subscribe) {
      if (this.subscribe[key]) {
        this.subscribe[key].unsubscribe();
      }
    }
  }

}
