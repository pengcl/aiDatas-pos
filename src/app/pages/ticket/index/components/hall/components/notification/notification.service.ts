import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../../../../../@core/utils/request.service';

export declare interface CreateBookInputDto {
  cinemaCode: string;
  isReleaseLock: number;
  reserveMemoryNum: string;
  reserveRemark?: string;
  terminalCode: string;
  uidComp: string;
  uidShopCart: string;
}

@Injectable({providedIn: 'root'})
export class TicketNotificationService {

  constructor(private requestSvc: RequestService) {
  }

  create(data: CreateBookInputDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posReserve/create', data);
  }
}
