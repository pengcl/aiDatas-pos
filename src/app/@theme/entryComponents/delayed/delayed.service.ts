import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../@core/utils/request.service';

export declare interface DelayedRequest {
  delayedTime: string;
  uidList: string[];
}

@Injectable({providedIn: 'root'})
export class DelayedService {

  constructor(private requestSvc: RequestService) {
  }

  delay(data: DelayedRequest): Observable<any> {
    return this.requestSvc.send('/orderService-api/posTake/timeLapseTicket', data);
  }

}
