import {Inject, Injectable} from '@angular/core';
import {RequestService} from '../../../../../../../@core/utils/request.service';
import {Observable} from 'rxjs';
import {UnlockRequest} from '../../../../../../getticket/getticket.service';

declare interface BookRequest {
  seatCode: string;
  uidPosResource: string;
}

declare interface PickUpBookTicketRequest {
  uidShopCart: string;
  terminalCode: string;
}

@Injectable({providedIn: 'root'})
export class BookdetailService {

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private requestSvc: RequestService) {
  }

  getReserveDetail(data: BookRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posReserve/getReserveDetail', data);
  }

  unlock(data: UnlockRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/unlock', data);
  }

  pickUpTicket(data: PickUpBookTicketRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/pickUpTicket', data);
  }

}
