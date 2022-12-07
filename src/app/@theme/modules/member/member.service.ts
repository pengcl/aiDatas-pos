import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of as observableOf} from 'rxjs';
import {RequestService} from '../../../@core/utils/request.service';
import {AppService} from '../../../app.service';
import {ShoppingCartService} from '../../../pages/shopping-cart/shopping-cart.service';
import {AuthService} from '../../../pages/auth/auth.service';
import {TicketService} from '../../../pages/ticket/ticket.service';
import {mergeMap as observableMargeMap} from 'rxjs/operators';

export declare interface MemberLoginInputDto {
  cardType: number;
  cinemaCode?: string;
  conditions: string;
  uidComp?: string;
}

export declare interface CartResInputDto {
  'cartResType': number;
  'uidComp'?: string;
  'uidResource': string;
}

export declare interface CreateMemberCardInputDto {
  'memberAlias': string;
  'memberCardLevelName': string;
  'memberCardNo': string;
  'memberMobile': string;
  'posShopCartResDTOList': CartResInputDto[];
  'uidMember': string;
  'uidMemberCard': string;
  'uidMemberCardLevel': string;
  'uidMemberCardOld': string;
  'cardLevelType': number;
  'uidShopCart'?: string;
  'uidComp'?: string;
  'terminalCode'?: string;
  'cinemaCode'?: string;
}

export declare interface AddMemberCardInputDto {
  cardLevelType: number;
  memberAlias: string;
  memberCardLevelName: string;
  memberCardNo: string;
  memberMobile: string;
  memberPoints: number;
  remainMoneyCash: number;
  remainMoneyCift: number;
  uidMember: string;
  uidMemberCard: string;
  uidMemberCardLevel: string;
  uidShopCart?: string;
  terminalCode?: string;
  uidComp?: string;
  cinemaCode?: string;
}

export declare interface MemberCountInputDto {
  cardno: string;
  uidComp?: string;
  uidCardLevel: string;
  uidMemberCard: string;
}

@Injectable({providedIn: 'root'})
export class MemberService {
  private member;
  private memberStatus = new BehaviorSubject<any>(this.currentMember);
  private card;
  private cardStatus = new BehaviorSubject<any>(this.currentCard);

  constructor(private requestSvc: RequestService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private ticketSvc: TicketService,
              private shoppingCartSvc: ShoppingCartService) {
  }

  login(data: MemberLoginInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/getMember', data);
  }

  logout(uid): Observable<any> {
    const data = {
      uid,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/orderService-api/posShopCart/cancellationMember', data);
  }

  create(data: CreateMemberCardInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidShopCart = this.shoppingCartSvc.currentCart;
    data.posShopCartResDTOList.forEach(item => {
      item.uidComp = this.appSvc.currentCinema.uidComp;
    });
    return this.requestSvc.send('/orderService-api/posShopCart/createCartMember', data);
  }

  add(data: AddMemberCardInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.uidShopCart = this.shoppingCartSvc.currentCart;
    /*data.posShopCartResDTOList.forEach(item => {
      item.uidComp = this.appSvc.currentCinema.uidComp;
    });*/
    return this.requestSvc.send('/orderService-api/posShopCart/addMemberInfo2shopCart', data);
  }

  count(data: MemberCountInputDto): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/getMemberCount', data);
  }

  verifyPassword(data: { memberPassword: string; uid: string, notErrorInterceptor?: boolean }): Observable<any> {
    data.notErrorInterceptor = true;
    return this.requestSvc.send('/memberService-api/member/verifyPassword', data);
  }

  sceneCount(uidMemberCard, uidCardLevel, memberNo, info): Observable<any> {
    const data: any = {
      uidScene: info.uidResource,
      uidMemberCard,
      uidCardLevel,
      memberNo,
      uidComp: this.appSvc.currentCinema.uidComp,
      notErrorInterceptor: true
    };
    return this.requestSvc.send('/memberService-api/member/getMemberThisSceneCount', data);
  }

  remove(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.currentMember) {
        this.logout(this.shoppingCartSvc.currentCart).subscribe(res => {
          if (res.status.status === 0) {
            this.updateMemberStatus(null);
            this.updateCardStatus(null);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        return resolve(true);
      }
    });
  }

  addMember(member, card, isSingle?): Observable<any> {
    const dto: AddMemberCardInputDto = {
      memberAlias: member.memberAlias,
      memberPoints: member.memberPoints,
      remainMoneyCash: card.remainMoneyCash,
      remainMoneyCift: card.remainMoneyCift,
      memberCardLevelName: card.cardLevelName,
      memberCardNo: card.cardNo,
      memberMobile: member.memberMobile,
      uidMember: member.uid,
      uidMemberCard: card.uidMemberCard,
      uidMemberCardLevel: card.uidCardLevel,
      cardLevelType: card.cardLevelType
    };
    return this.add(dto).pipe(observableMargeMap(res => {
      card.bussinessUid = this.shoppingCartSvc.currentCart;
      if (isSingle) {
        card.totalSaleTicketCountToday = member.totalSaleTicketCountToday;
        card.cardParamEntityList = member.cardParamEntityList;
        card.curPosResourctTicketCount = member.curPosResourctTicketCount;
        member.card = card;
        this.updateMemberStatus(member);
        this.updateCardStatus(card);
        // todo:每日限购折扣票数
        /*const limit = getEntityValue(res.data.cardParamEntityList, 'dayLimit'); // 每日限购折扣票数
        if (parseInt(res.data.totalSaleTicketCountToday, 10) > parseInt(limit, 10)) {
          this.message.warning('当前会员卡购票已超出每日限购折扣票数，无法继续使用优惠。');
        }*/
        return observableOf(member);
      } else {
        const body = {
          uidScene: (this.ticketSvc.currentPlan ? this.ticketSvc.currentPlan.uidPlan : ''),
          uidCardLevel: card.uidCardLevel,
          cardno: card.cardNo,
          uidMemberCard: card.uidMemberCard
        };
        return this.count(body).pipe(observableMargeMap((count => {
          card.totalSaleTicketCountToday = count.data.totalSaleTicketCountToday;
          card.cardParamEntityList = count.data.cardParamEntityList;
          card.curPosResourctTicketCount = count.data.curPosResourctTicketCount;
          member.card = card;
          this.updateMemberStatus(member);
          this.updateCardStatus(card);
          // todo:每日限购折扣票数
          /*const limit = getEntityValue(res.data.cardParamEntityList, 'dayLimit'); // 每日限购折扣票数
          if (parseInt(res.data.totalSaleTicketCountToday, 10) > parseInt(limit, 10)) {
            this.message.warning('当前会员卡购票已超出每日限购折扣票数，无法继续使用优惠。');
          }*/
          return observableOf(member);
        })));
      }
    }));
  }

  setMember(member, card, isSingle?): Observable<any> {
    const dto: CreateMemberCardInputDto = {
      memberAlias: member.memberAlias,
      memberCardLevelName: card.cardLevelName,
      memberCardNo: card.cardNo,
      memberMobile: member.memberMobile,
      posShopCartResDTOList: [{
        cartResType: 3,
        uidResource: member.uid
      }],
      uidMember: member.uid,
      uidMemberCard: card.uidMemberCard,
      uidMemberCardLevel: card.uidCardLevel,
      uidMemberCardOld: '',
      cardLevelType: card.cardLevelType
    };
    return this.create(dto).pipe(observableMargeMap(res => {
      card.bussinessUid = res.data.uid;
      if (isSingle) {
        card.totalSaleTicketCountToday = member.totalSaleTicketCountToday;
        card.cardParamEntityList = member.cardParamEntityList;
        card.curPosResourctTicketCount = member.curPosResourctTicketCount;
        member.card = card;
        this.updateMemberStatus(member);
        this.updateCardStatus(card);
        // todo:每日限购折扣票数
        /*const limit = getEntityValue(res.data.cardParamEntityList, 'dayLimit'); // 每日限购折扣票数
        if (parseInt(res.data.totalSaleTicketCountToday, 10) > parseInt(limit, 10)) {
          this.message.warning('当前会员卡购票已超出每日限购折扣票数，无法继续使用优惠。');
        }*/
        return observableOf(member);
      } else {
        const body = {
          uidScene: (this.ticketSvc.currentPlan ? this.ticketSvc.currentPlan.uidPlan : ''),
          uidCardLevel: card.uidCardLevel,
          cardno: card.cardNo,
          uidMemberCard: card.uidMemberCard
        };
        return this.count(body)
        .pipe(observableMargeMap((count => {
          card.totalSaleTicketCountToday = count.data.totalSaleTicketCountToday;
          card.cardParamEntityList = count.data.cardParamEntityList;
          card.curPosResourctTicketCount = count.data.curPosResourctTicketCount;
          member.card = card;
          this.updateMemberStatus(member);
          this.updateCardStatus(card);
          // todo:每日限购折扣票数
          /*const limit = getEntityValue(res.data.cardParamEntityList, 'dayLimit'); // 每日限购折扣票数
          if (parseInt(res.data.totalSaleTicketCountToday, 10) > parseInt(limit, 10)) {
            this.message.warning('当前会员卡购票已超出每日限购折扣票数，无法继续使用优惠。');
          }*/
          return observableOf(member);
        })));
      }
    }));
  }

  get currentMember() {
    return this.member;
  }

  getMemberStatus(): Observable<any> {
    return this.memberStatus.asObservable();
  }

  updateMemberStatus(member) {
    this.member = member;
    this.memberStatus.next(this.member);
  }

  get currentCard() {
    return this.card;
  }

  getCardStatus(): Observable<any> {
    return this.cardStatus.asObservable();
  }

  updateCardStatus(card) {
    this.card = card;
    this.cardStatus.next(this.card);
  }
}
