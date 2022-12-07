import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../../@core/utils/request.service';

export declare interface RefundViewDto {
  uidPosBill: string;
  page?: any;
}

@Injectable({providedIn: 'root'})
export class ReprintViewService {

  constructor(private requestSvc: RequestService) {
  }

  getRefundDetail(data: RefundViewDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getRefundDetail', data);
  }

}
