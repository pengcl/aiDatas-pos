import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestService} from '../../@core/utils/request.service';
import {ReprintRequest, ReprintTicketRequest} from '../reprint/reprint.service';

export declare interface PosOrderDto {
  search: string;
  uidComp: string;
}

@Injectable({providedIn: 'root'})
export class OrderService {

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private http: HttpClient,
              private requestSvc: RequestService) {
  }

  getPosOrderDetail(data: PosOrderDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getPosOrderDetail', data);
  }

  updatePrintTime(data: ReprintTicketRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/updatePrintTime', data);
  }

  getOrderList(data: any): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/list', data);
  }

  getPosPayModeBill(data: any): Observable<any> {
    return this.requestSvc.send('/payService-api/pospaymode/getPosPayModeBill', data);
  }

}
