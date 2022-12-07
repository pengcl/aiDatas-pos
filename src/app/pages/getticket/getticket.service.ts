import {Injectable} from '@angular/core';
import {RequestService} from '../../@core/utils/request.service';
import {Observable} from 'rxjs';

export declare interface GetTicketDto {
  cinemaCode: string;
  billTakeCode: string;
  billVerifyCode: string;
}

export declare interface BookTicketDto {
  cinemaCode: string;
  ticketWithdrawal: string;
}

export declare interface BlockPlanDto {
  cinemaCode: string;
  billVerifyCode: string;
  orderId: string;
}

export declare interface ConfirmBlockPlanDto {
  omsOrderDetailDTO?: any;
  bookMovieDTO?: any;
  omsOrderHallBookTimeDTO?: any;
  uidComp: string;
  bookOrderGoods?: any;
  terminalCode: string;
}

export declare interface AuthRequest {
  authFuctionCode: string;
  authFuctionName: string;
  authFuctionType: string;
  uidAuthFuction: string;
  cinemaCode: string;
  accountLoginName: string;
  accountLoginPassword: string;
  orgAlias: string;
}

export declare interface PrintTempRequest {
  seatCode: string;
  typeCodeList?: string[];
  uidBill?: string;
  uidComp: string;
}

export declare interface PrintRequest {
  uidRes: string;
  uidComp: string;
}

export declare interface TakeRequest {
  uidPosBill: string;
  uidComp: string;
}

export declare interface UnlockRequest {
  uidShopCart: string;
}

export declare interface PickupTicketRequest {
  uidShopCart: string;
  terminalCode: string;
}

export declare interface PrintTakeRequest {
  uidComp: string;
  uidPosBill: string;
}


@Injectable({providedIn: 'root'})
export class GetTicketService {

  constructor(private requestSvc: RequestService) {
  }

  getBillTicketList(data: GetTicketDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/getBillTicketList', data);
  }

  getBillSeatList(data: BookTicketDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/getBillSeatListMtx', data);
  }

  omsOrderDetailQuery(data: BlockPlanDto): Observable<any> {
    return this.requestSvc.send('/oms-api/order/omsOrderDetailQuery', data);
  }

  confirmBlockPlan(data: ConfirmBlockPlanDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/bookHall/confirm', data);
  }

  auth(data: AuthRequest): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/posAuth', data);
  }

  print(data: PrintRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/rePrintTicket', data);
  }

  printTemp(data: PrintTempRequest): Observable<any> {
    return this.requestSvc.send('/printTempletService-api/templetPrint/printTemp', data);
  }

  completeTakeTicket(data: TakeRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/completTakeTicket', data);
  }

  unlock(data: UnlockRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/unlock', data);
  }

  pickUpTicket(data: PickupTicketRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/pickUpTicket', data);
  }

  completTakePrintTicket(data: PrintTakeRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/completTakePrintTicket', data);
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
