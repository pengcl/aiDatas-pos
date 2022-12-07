import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {RequestService} from '../../@core/utils/request.service';
import {Observable} from 'rxjs';

export declare interface PickupDto {
  cinemaCode: string;
  billTakeCode: string;
  billVerifyCode: string;
  uidComp: string;
}

export declare interface PickupRequest {
  uidPosBill: string;
  uidResComboList?: string[];
  uidResList?: string[];
  teminalCode: string;
  cinemaCode: string;
}

@Injectable({providedIn: 'root'})
export class PickupService {

  constructor(private router: Router,
              private requestSvc: RequestService) {
  }

  getBillResList(data: PickupDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/getBillResList', data);
  }

  getCompletTakeRes(data: PickupRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/completTakeRes', data);
  }

}
