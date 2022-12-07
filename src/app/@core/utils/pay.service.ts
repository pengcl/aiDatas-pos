import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from './request.service';

export declare interface ModesInputDto {
  isPaySupply: number;
  uidComp: string;
}

export declare interface PayDetailInputDto {
  cinemaCode: string;
  uidComp: string;
  uidShopCart: string;
}

@Injectable({providedIn: 'root'})
export class PayService {

  constructor(private requestSvc: RequestService) {
  }

  modes(data: ModesInputDto): Observable<any> {
    return this.requestSvc.send('/payService-api/pospaymode/getPosPayModeIsSupply', data);
  }

  details(data: PayDetailInputDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getPayDetail', data);
  }
}
