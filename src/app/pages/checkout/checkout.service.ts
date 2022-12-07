import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { RequestService } from '../../@core/utils/request.service';
import { AppService } from '../../app.service';
import { AuthService } from '../auth/auth.service';
import { ShoppingCartService, ActivitiesInputDto } from '../shopping-cart/shopping-cart.service';
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

export declare interface AddItemsInputDto {
  cinemaCode: string;
  posShopCartPlanDTO: CartPlanInputDto;
  terminalCode: string;
  uidShopCart: string;
}

export declare interface DelItemInputDto {
  resType: number;
  seatCodeList: string[];
  uidResource: string;
  uidResourcePlan: string;
  uidShopCart: string;
}

export declare interface DelItemsInputDto {
  resType: number;
  seatCodeList: string[];
  uidPosResource: string;
  uidShopCart: string;
}

export declare interface SubmitItemsInputDto {
  cinemaCode: string;
  posShopCartPlanDTO: CartPlanInputDto;
  terminalCode: string;
  uidShopCart: string;
}


// 支付确认订单
export declare interface SaveBillInputDto {
  uidComp: string;
  cinemaCode: string;
  uidShopCart: string;
  memberInfo?: any;
  payment?: any;
  takeGoodsType: string;
  billCreateName: string;
  billSaleType: string;
}

// 查询已支付记录
export declare interface QueryPaymentDto {
  uidShopCart: string;
}

// 删除已支付记录
export declare interface DelPaymentDto {
  uidShopCart: string;
  uidPosPay: string;
}
export declare interface PrintTakeRequest {
  uidComp: string;
  uidPosBill: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private uidPosShopCart = null;
  private cartStatus = new Subject<boolean>();

  private shoppingCartInfo; // 当前购物车信息
  private shoppingCartDetail = new BehaviorSubject<any>(this.currentShoppingCartDetail);  // 购物车信息

  constructor(
    private requestSvc: RequestService,
    private appSvc: AppService,
    private authSvc: AuthService,
    private shoppingCartSvc: ShoppingCartService,
  ) {
  }

  get currentShoppingCartDetail() {
    return this.shoppingCartInfo;
  }

  // 更新购物车资料
  refreshShoppingcartDetail(shoppingCartInfo) {
    this.shoppingCartInfo = shoppingCartInfo;
    this.shoppingCartDetail.next(this.shoppingCartInfo);
  }
  // 清空购物车资料
  clearShoppingCartDetail() {
    this.shoppingCartInfo = null;
    this.shoppingCartDetail.next(this.shoppingCartInfo);
  }

  // 订阅购物车资料
  getShoppingCartDetail(): Observable<any> {
    return this.shoppingCartDetail.asObservable();
  }

  // 查询购物车详情
  queryShopCartDetail(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/queryShopCartDetail', data);
  }

  // 查询活动
  queryActivities(data: any): Observable<any> {
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/pos/queryShoppingCartCampaign', data);
  }

  // 参与或取消活动
  promotionCampagin(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/promotionCampagin', data);
  }
  // 获取可用的支付方式
  getPayType(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/payService-api/pospaymode/getPosPayModeIsSupply', data);
  }

  // 结算页面点击取消操作
  cancelNotCompleteBill(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/cancelNotCompleteBill', data);
  }

  // 删除已支付记录
  delPayment(data: any): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/billManagement/pos/v1/deletePayment', data);
  }

  // 确认订单
  saveBill(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/billManagement/pos/savePosBill', data);
  }
  // 打印影票
  completTakePrintTicket(data: any): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/posTake/completTakePrintTicket', data);
  }
  // 会员查询
  memberQuery(data: any): Observable<any> {
    data.version = '2';
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/posMemberQuery', data);
  }
  // 查询会员票券
  queryMemberTicket(data: any): Observable<any> {
    data.uidOrg = this.authSvc.currentUidOrg;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/ticketService-api/ticketUsing/v1/queryMemberTicket', data);
  }
  // 查询团购券种类
  queryGroupTicket(data: any): Observable<any> {
    data.uidOrg = this.authSvc.currentUidOrg;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/ticketService-api/ticket/ticketIssuesListForPos', data);
  }

  // 添加票券
  addTicket(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidOrg = this.authSvc.currentUidOrg;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/ticketUsing', data);
  }
  // 删除票券
  delTicket(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidOrg = this.authSvc.currentUidOrg;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/ticketCancelUsing', data);
  }
  // 会员业务订单
  saveMemberRechargeBill(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/billManagement/pos/saveMemberRechargeBill', data);
  }

  // 变更购物车取货，取餐方式
  changePosShopCartTakeGoodsType(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.channelCode = 'QIANTAI';
    return this.requestSvc.send('/orderService-api/shoppingCardManagement/changePosShopCartTakeGoodsType', data);
  }

  setCurrentCart(uidPosShopCart) {
    this.uidPosShopCart = uidPosShopCart;
  }



  get isCreated(): boolean {
    this.cartStatus.next(!!this.currentCart);
    return !!this.currentCart;
  }

  get currentCart() {
    return this.uidPosShopCart;
  }

  // 获取影票信息码串
  getTicketCodeInfo(data: any): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getTicketCodeInfoList', data);
  }

  // 修改影票信息码
  updateTicketCodeInfo(data: any): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/updateTicketCodeInfo', data);
  }

}
