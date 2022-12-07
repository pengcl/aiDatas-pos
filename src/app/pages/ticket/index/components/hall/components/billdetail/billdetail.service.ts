import {Inject, Injectable} from '@angular/core';
import {RequestService} from '../../../../../../../@core/utils/request.service';
import {Observable} from 'rxjs';

declare interface SoldRequest {
  resSeatCode: string;
  uidResource: string;
}

@Injectable({providedIn: 'root'})
export class BillDetailService {

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private requestSvc: RequestService) {
  }

  getBillSeatDetail(data: SoldRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getBillSeatDetail', data);
  }

}
