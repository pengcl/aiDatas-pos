import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {AuthService} from '../auth/auth.service';
import {AppService} from '../../app.service';
import {RequestService} from '../../@core/utils/request.service';

@Injectable({providedIn: 'root'})
export class CateringService {

  constructor(private authSvc: AuthService, private appSvc: AppService, private requestSvc: RequestService) {
  }

  items(body): Observable<any> {
    body.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/orderService-api/posBill/queryOrderOfPeican', body);
  }

  item(uidBill): Observable<any> {
    const body: any = {uidBill};
    body.status = 1;
    body.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/orderService-api/posBill/queryOrderDetailOfPeican', body);
  }

  print(uidBill): Observable<any> {
    const body: any = {uidBill};
    body.typeCode = 'T00211';
    body.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/printTempletService-api/templetPrint/print', body);
  }

  done(uidBill): Observable<any> {
    const body: any = {uidBill};
    body.terminalCode = this.authSvc.currentTerminalCode;
    body.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    body.billTakeStatus = '2';
    body.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/orderService-api/posBill/changeOrderFoodStatus', body);
  }

  finished(uidBill): Observable<any> {
    const body: any = {uidBill};
    body.terminalCode = this.authSvc.currentTerminalCode;
    body.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    body.billTakeStatus = '3';
    body.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/orderService-api/posBill/changeOrderFoodStatus', body);
  }
}
