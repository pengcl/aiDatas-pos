import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../../@core/utils/request.service';

export declare interface ViewDto {
  uidAppendApply: string;
}

@Injectable({providedIn: 'root'})
export class ViewService {

  constructor(private requestSvc: RequestService) {
  }

  getAppendApplyDetailList(data: ViewDto): Observable<any> {
    return this.requestSvc.send('/orderService-api/posAppend/getAppendApplyDetailList', data);
  }

}
