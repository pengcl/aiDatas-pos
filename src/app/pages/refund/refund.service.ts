import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {StorageService} from '../../@core/utils/storage.service';
import {RequestService} from '../../@core/utils/request.service';
import {ToastService} from '../../@theme/modules/toast';
import {DialogService} from '../../@theme/modules/dialog';
import {Observable} from 'rxjs';


export declare interface GetBillRequest {
  search: string;
  uidComp: string;
}

export declare interface RefundBillRequest {
  teminalCode: string;
  cinemaCode: string;
  isReturnServiceNet: number;
  rejectReasonCode: string;
  rejectReasonDesc: string;
  uidBill: string;
  refundTicketDTOList: any;
  refundDeatilDTOList: any;
  refundGoodsList: any;
  refundPaymentList: any;
  selfRefundPayment: number;
}

export declare interface RefundPosPayModeRequest {
  uidComp: string;
}

export declare interface GetRefundPlanRequest {
  showType: string;
  date: string;
  planApproveStatus: number;
  uidField: string;
  uidComp: string;
  movieName: string;
}

export declare interface RefundPlanRequest {
  billPayAmount: number;
  isReturnServiceNet: number;
  rejectReasonCode: string;
  rejectReasonDesc: string;
  terminalCode: string;
  payModeCode: string;
  uidPayMode: string;
  uidPlan: string;
}

export declare interface RefundBillInfoRequest {
  uidPlan: string;
}

export declare interface ApplyRefundRequest {
  uidComp: string;
  cinemaCode: string;
  approveStatus: number;
  uidField: string;
  maxShowDate: string;
  minShowDate: string;
  planMovieName: string;
  page?: any;
}

@Injectable({providedIn: 'root'})
export class RefundService {

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private http: HttpClient,
              private router: Router,
              private storage: StorageService,
              private requestSvc: RequestService,
              private toastSvc: ToastService,
              private dialogSvc: DialogService) {
  }

  getPosBill(data: GetBillRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getPosBill', data);
  }

  refundBill(data: RefundBillRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/billManagement/pos/v1/refundBill', data);
  }

  getAllRefundPosPayModeList(data: RefundPosPayModeRequest): Observable<any> {
    return this.requestSvc.send('/payService-api/pospaymode/getAllRefundPosPayModeList', data);
  }

  getRefundPlan(data: GetRefundPlanRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getRefundPlan', data);
  }

  saveRefundBillTicketNew(data: RefundPlanRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/saveRefundBillTicketNew', data);
  }

  getRefundBillInfo(data: RefundBillInfoRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getRefundBillInfo', data);
  }

  getApplyForRefund(data: ApplyRefundRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/applicationForRefund', data);
  }

}
