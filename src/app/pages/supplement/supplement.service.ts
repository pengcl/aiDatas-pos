import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {StorageService} from '../../@core/utils/storage.service';
import {RequestService} from '../../@core/utils/request.service';
import {ToastService} from '../../@theme/modules/toast';
import {DialogService} from '../../@theme/modules/dialog';
import {Observable} from 'rxjs';

export declare interface HallRequest {
  uidComp: string;
}

export declare interface SulPlanRequest {
  showType: string;
  uidComp: string;
  planApproveStatus: number;
  uidField: string;
  date: string;
}

export declare interface PlanInfoRequest {
  uidPlan: string;
}

export declare interface AppendRequest {
  payModeCode: string;
  payModeName: string;
  ticketNum: any;
  ticketPrice: any;
  uidComp: string;
  uidPayMode: string;
  uidPlan: string;
}

export declare interface DelAppendRequest {
  uid: string;
}

export declare interface CommitAppendRequest {
  terminalCode: string;
  uidList: string[];
}

export declare interface ApplyAppendRequest {
  terminalCode: string;
  cinemaCode: string;
  hallCode?: string;
  movieName?: string;
  showTimeEnd?: string;
  showTimeStart?: string;
  page?: any;
}

@Injectable({providedIn: 'root'})
export class SupplementService {

  constructor(private http: HttpClient,
              private router: Router,
              private storage: StorageService,
              private requestSvc: RequestService) {
  }

  getFieldByUidList(data: HallRequest): Observable<any> {
    return this.requestSvc.send('/fieldService-api/hall/getFieldByUidList', data);
  }

  getPlans(data: SulPlanRequest): Observable<any> {
    return this.requestSvc.send('/planAndPriceService-api/plan/listForPos', data);
  }

  getPlanInfo(data: PlanInfoRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/getAppendPlanInfo', data);
  }

  getPosPayModeList(data: HallRequest): Observable<any> {
    return this.requestSvc.send('/payService-api/pospaymode/getAppendPosPayModeList', data);
  }

  getPlanAppendDetailList(data: PlanInfoRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/getPlanAppendDetailList', data);
  }

  append(data: AppendRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/create', data);
  }

  delAppend(data: DelAppendRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/deletePlanAppendDetail', data);
  }

  commitAppend(data: CommitAppendRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/confirmAppend', data);
  }

  getAppendApplyList(data: ApplyAppendRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/getAppendApplyList', data);
  }

}
