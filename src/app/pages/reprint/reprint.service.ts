import {Injectable} from '@angular/core';
import {RequestService} from '../../@core/utils/request.service';
import {Observable} from 'rxjs';

export declare interface ReprintRequest {
  billCode: string;
  cinemaCode: string;
  timeType: string;
  uidComp: string;
  page: any;
}

export declare interface ReprintTicketRequest {
  uidTicketCert: string;
}

@Injectable({providedIn: 'root'})
export class ReprintService {

  constructor(private requestSvc: RequestService) {
  }

  getReprintCertlist(data: ReprintRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/reprintCertlist', data);
  }

  getReprintTicketlist(data: ReprintRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/reprintTicketlist', data);
  }

  updatePrintTime(data: ReprintTicketRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/updatePrintTime', data);
  }

}
