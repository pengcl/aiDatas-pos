import {Injectable} from '@angular/core';
import {RequestService} from '../../@core/utils/request.service';
import {Observable} from 'rxjs';

export declare interface VerifyRequest {
  ticketCode: string;
  cinemaCode: string;
}

@Injectable({providedIn: 'root'})
export class CheckTicketService {

  constructor(private requestSvc: RequestService) {
  }

  posCheckVerify(data: VerifyRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posCheck/verify', data);
  }

}
