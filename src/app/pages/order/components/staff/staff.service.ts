import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../../@core/utils/request.service';


@Injectable({providedIn: 'root'})
export class StaffViewService {

  constructor(private requestSvc: RequestService) {
  }

  getAccountList(data: any): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/list', data);
  }

}
