import { Injectable } from '@angular/core';
import { Observable, Subject, of as observableOf } from 'rxjs';

import { RequestService } from '../../@core/utils/request.service';
import { AppService } from '../../app.service';
import { AuthService } from '../auth/auth.service';
import { TicketService } from '../ticket/ticket.service';
import { ProductService } from '../product/product.service';
import { PointsService } from '../points/points.service';
import { CouponService } from '../coupon/coupon.service';

export declare interface CreateCartInputDto {
  cinemaCode: string;
  terminalCode: string;
  uidComp: string;
}

export declare interface CartSeatInputDto {
  cartSeatCode: string;
  cartSeatCol: string;
  cartSeatLevel: string;
  cartSeatLevelCode: string;
  cartSeatPriceOri: string;
  cartSeatRow: string;
  cartSeatTicketType: string;
  resSeatType: string;
  seatPriceService: string;
  seatPriceSupplyValue: string;
  uidPosResSeat: string;
  uidTicketType: string;
}

export declare interface CartPlanInputDto {
  cartHallCode: string;
  cartHallName: string;
  cartHallType: string;
  cartMovieDuration: string;
  cartMovieLanguage: string;
  cartMovieName: string;
  cartMoviePublish: string;
  movieCode: string;
  planLimitPrice: number;
  posShopCartPlanSeatDTOList: CartSeatInputDto[];
  resourceCode: string;
  showTimeEnd: string;
  showTimeStart: string;
  terminalCode: string;
  uid: string;
  uidPosResource: string;
}

export declare interface CartProductContainList {
  nameRes: string;
  uidRes: string;
  priceRes?: number;
  codeRes?: string;
}

export declare interface CartProductInputDto {
  cartResName?: string;
  cartResPrice?: number;
  cartResPriceOri?: number;
  cartResType: number | string;
  isPointsPay: number | string;
  nameResStr?: string;
  shopCartResContainList?: CartProductContainList[];
  isSelfMer?: number;
  isSeviceMer?: number;
  pointsChangePoints?: number;
  pointsChangePrice?: number;
  totalPoints?: number;
  cartResCode?: string;
  uid?: string;
  uidComp?: string;
  uidResource: string;
}

export declare interface AddItemsInputDto {
  cinemaCode?: string;
  memberAlias?: string;
  memberCardLevelName?: string;
  memberCardNo?: string;
  memberMobile?: string;
  uidMember?: string;
  uidMemberCard?: string;
  uidMemberCardLevel?: string;
  posShopCartPlanDTO?: CartPlanInputDto;
  posShopCartResDTOList?: CartProductInputDto[];
  terminalCode?: string;
  uidComp?: string;
  uidShopCart?: string;
}

export declare interface DelItemInputDto {
  uid?: string;
  resType: number;
  seatCodeList?: string[];
  uidResource: string;
  uidResourcePlan?: string;
  uidShopCart: string;
}

export declare interface DelItemsInputDto {
  resType: number;
  seatCodeList?: string[];
  uidPosResource: string;
  uidShopCart?: string;
}

export declare interface SubmitItemsInputDto {
  cinemaCode: string;
  posShopCartPlanDTO: CartPlanInputDto;
  terminalCode: string;
  uidShopCart: string;
}

export declare interface DetailsInputDto {
  cinemaCode?: string;
  terminalCode?: string;
  uidShopCart?: string;
  uidComp?: string;
  uidShopCartOri?: string;
}

export declare interface ProductInputDto {
  number: number;
  price: number;
  producetUid: string;
  ticketCode: null | string;
  ticketDesc: null | string;
  uid: string;
  uidMerCategory: string;
}

export declare interface TicketInputDto {
  number: number;
  price: number;
  serviceFee: number;
  subsidyFee: number;
  ticketType: string;
}

export declare interface PlanSeatInputDto {
  campaignDesc: null | string;
  cartSeatCode: string;
  cartSeatCol: string;
  cartSeatLevel: string;
  cartSeatPrice: number;
  cartSeatPriceActual: number;
  cartSeatPriceOri: number;
  cartSeatPriceService: number;
  cartSeatPriceSupplyValue: number;
  cartSeatReleaseTime: null | string;
  cartSeatRow: string;
  cartSeatTicketType: string;
  isShowYouHui: boolean;
  namePayMode: null | number;
  priceDisPlay: string;
  seatAlias: string;
  ticketDesc: null | string;
  uid: string;
  uidPayMode: null | number;
  uidPosResSeat: string;
  uidShopCartPlan: string;
}

export declare interface MemberInputDto {
  uidMember: string;
  uidMemberCard: string;
  memberLevel: string;
}

export declare interface ActivitiesInputDto {
  cartHallType: string;
  cartMoviePublish: string;
  dateTimeOfMovie: string;
  movieName: string;
  posShopCartPlanSeat: PlanSeatInputDto;
  products?: ProductInputDto[];
  tickets?: TicketInputDto[];
  member?: MemberInputDto;
  serviceFee: number;
  subsidyFee: number;
  uidChannel: string;
  uidCinema: string;
  uidMovie: string;
  uidPosResourcePlan: string;
  uidComp?: string;
  terminalCode?: string;
}

export declare interface EmptyCartInputDto {
  isDeleteCart: number;
  uid: string;
}

export declare interface UpdateInputDto {
  posShopCartResPriceList: PosShopCartResPriceItem[];
}

export declare interface PosShopCartResPriceItem {
  cartResPrice: number;
  uid: string;
}

/*cartResType 0:普通商品,1:套餐,2:票券商品,3:会员卡商品,4:积分商品*/
@Injectable({providedIn: 'root'})
export class ShoppingCartService {
  private uidPosShopCart = null;
  private uidPosHangCart = null;
  private cartStatus = new Subject<boolean>();

  constructor(private requestSvc: RequestService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private ticketSvc: TicketService,
              private pointsSvc: PointsService,
              private couponSvc: CouponService,
              private productSvc: ProductService) {
  }

  /* http://10.0.0.11:8082/orderService-api/posShopCart/list */
  list(): Observable<any> {
    const data: any = {};
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.uidShopCart = this.currentCart;
    return this.requestSvc.send('/orderService-api/posShopCart/list', data);
  }

  details(uidShopCartOri?): Observable<any> {
    const data: DetailsInputDto = {};
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.uidShopCart = this.currentCart;
    if (uidShopCartOri) {
      data.uidShopCartOri = uidShopCartOri;
    }
    // 旧接口
    // return this.requestSvc.send('/orderService-api/posShopCart/detail', data);
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/queryShopCartDetail', data);
  }

  create(): Observable<any> {
    const data: CreateCartInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      terminalCode: this.authSvc.currentTerminalCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/orderService-api/posShopCart/createBlankShopCart', data);
  }

  add(data: AddItemsInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/orderService-api/posShopCart/v2/createCartRes', data);
  }

  load(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.staticURL = '../../staticData';
    return this.requestSvc.send('/orderService-api/posShopCart/loadShopCart', data);
  }

  loss(): Observable<any> {
    return this.requestSvc.send('/merService-api/whMerRegIster/submit', {uid: this.currentCart});
  }

  addV1(data: AddItemsInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.uidShopCart = this.currentCart;
    return this.requestSvc.send('/orderService-api/posShopCart/createCartRes', data);
  }

  update(data: UpdateInputDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posShopCart/updateCartResPrice', data);
  }

  del(data: DelItemInputDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posShopCart/v2/deleteRes', data);
  }

  delV1(data: DelItemInputDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posShopCart/deleteRes', data);
  }

  delCart(uid) {
    const data: any = {
      uid,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/orderService-api/posShopCart/deleteCart', data);
  }

  emptyCart(): Observable<any> {
    const data: EmptyCartInputDto = {
      isDeleteCart: 0,
      uid: this.currentCart
    };
    return this.requestSvc.send('/orderService-api/posShopCart/emptyCart', data);
  }

  reduction(): Observable<any> {
    const data = {
      uid: this.currentCart,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/orderService-api/posShopCart/reductionShopCart', data);
  }

  batchDel(data: DelItemsInputDto): Observable<any> {
    data.uidShopCart = this.currentCart;
    return this.requestSvc.send('/orderService-api/posShopCart/v2/batchDeleteRes', data);
  }

  batchDelV1(data: DelItemsInputDto): Observable<any> {
    data.uidShopCart = this.currentCart;
    return this.requestSvc.send('/orderService-api/posShopCart/batchDeleteRes', data);
  }

  submit(data: SubmitItemsInputDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posShopCart/v2/submitShopCart', data);
  }

  createCart(): Observable<any> {
    const data = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      terminalCode: this.authSvc.currentTerminalCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/orderService-api/posShopCart/createCart', data);
  }

  updateStatus(): Observable<any> {
    const data = {
      uid: this.currentCart
    };
    return this.requestSvc.send('/orderService-api/posShopCart/updateStatus', data);
  }

  /*http://10.0.0.11:8082/orderService-api/posShopCart/createCart*/

  setCurrentCart(uidPosShopCart) {
    this.uidPosShopCart = uidPosShopCart;
  }

  createEmptyCart(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.create().subscribe(res => {
        this.setCurrentCart(res.data);
        return resolve(res.data);
      });
    });
  }

  clear() {
    this.ticketSvc.updateSelectedStatus({});
    this.productSvc.updateSelectedStatus([]);
    this.pointsSvc.updateSelectedStatus([]);
    this.couponSvc.updateSelectedStatus([]);
  }

  empty(callback?) {
    this.emptyCart().subscribe(res => {
      if (res.status.status === 0) {
        this.clear();
        this.unlocks().subscribe();
        if (callback) {
          callback();
        }
        this.createEmptyCart().then();
      }
    });
  }

  unlocks(): Observable<any> {// 解除销座
    const seatCodeList = [];
    const selected = this.ticketSvc.currentSelected;
    for (const key in selected) {
      if (selected[key]) {
        seatCodeList.push(selected[key].resSeatCode);
      }
    }
    if (seatCodeList.length > 0) {
      return this.batchDel({
        resType: 1,
        seatCodeList,
        uidPosResource: this.ticketSvc.currentInfo.uidResource,
        uidShopCart: this.currentCart
      });
    } else {
      return observableOf({});
    }
  }

  createAddProductInputDto(products) {
    const inputDto: AddItemsInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      posShopCartResDTOList: products,
      terminalCode: this.authSvc.currentTerminalCode,
      uidShopCart: this.currentCart
    };
    return inputDto;
  }

  creatShoppingCartInputDto(seats): any {
    const plan = this.ticketSvc.currentPlan;
    const info = this.ticketSvc.currentInfo;
    const posShopCartPlanSeatDTOList: CartSeatInputDto[] = [];
    seats.forEach(seat => {// 创建CartSeatInputDto[]
      posShopCartPlanSeatDTOList.push({
        cartSeatCode: seat.resSeatCode,
        cartSeatCol: seat.resSeatCol,
        cartSeatLevel: seat.resSeatLevel,
        cartSeatLevelCode: seat.resSeatLevelCode,
        cartSeatPriceOri: seat.levelPrice.price,
        cartSeatRow: seat.resSeatRow,
        cartSeatTicketType: seat.ticketType.ticketTypeName,
        resSeatType: seat.resSeatType,
        seatPriceService: seat.levelPrice.seatPriceService,
        seatPriceSupplyValue: seat.levelPrice.seatPriceSupplyValue,
        uidPosResSeat: seat.uid,
        uidTicketType: seat.ticketType.uidTicketType
      });
    });
    const inputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      posShopCartPlanDTO: {
        cartHallCode: plan.codeHall,
        cartHallName: plan.hallName,
        cartHallType: plan.typeHall,
        cartMovieDuration: plan.planMovieDuration,
        cartMovieLanguage: plan.posMovieLan,
        cartMovieName: plan.posMovieName,
        cartMoviePublish: plan.planMoviePublish,
        movieCode: plan.posMovieCode,
        planLimitPrice: plan.planLimitPrice,
        posShopCartPlanSeatDTOList,
        resourceCode: plan.posResCode,
        showTimeEnd: plan.posEndTime,
        showTimeStart: plan.posStartTime,
        terminalCode: this.authSvc.currentTerminalCode,
        uid: plan.uidPlan,
        uidPosResource: info.uidResource
      },
      terminalCode: this.authSvc.currentTerminalCode,
      uidShopCart: this.currentCart
    };
    return inputDto;
  }

  checkShoppingCart() {
    const seats = [];
    const products = this.productSvc.currentSelected;
    const selected = this.ticketSvc.currentSelected;
    const points = this.pointsSvc.currentSelected;
    const coupons = this.couponSvc.currentSelected;
    for (const key in selected) {
      if (selected[key]) {
        seats.push(selected[key]);
      }
    }
    return {
      seats,
      products,
      points,
      coupons
    };
  }

  get isCreated(): boolean {
    this.cartStatus.next(!!this.currentCart);
    return !!this.currentCart;
  }

  get currentCart() {
    return this.uidPosShopCart;
  }

  get currentHangCart() {
    this.uidPosHangCart = this.uidPosHangCart ? this.uidPosShopCart : this.uidPosHangCart;
    return this.uidPosHangCart;
  }
}
