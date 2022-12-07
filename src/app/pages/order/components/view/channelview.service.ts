import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../../@core/utils/request.service';


@Injectable({providedIn: 'root'})
export class ChannelViewService {

  constructor(private requestSvc: RequestService) {
  }

  queryChannelCustomList(data: any): Observable<any> {
    return this.requestSvc.send('/channelService-api/channelCustom/queryChannelCustomList', data);
  }

}
