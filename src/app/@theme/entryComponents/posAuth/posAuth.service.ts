import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../@core/utils/request.service';

export declare interface AuthDto {
  authFuctionCode: string;
  authFuctionName: string;
  authFuctionType: string;
  uidAuthFuction: string;
  cinemaCode: string;
  accountLoginName: string;
  accountLoginPassword: string;
  orgAlias: string;
}

@Injectable({providedIn: 'root'})
export class PosAuthService {

  constructor(private requestSvc: RequestService) {
  }

  auth(data: AuthDto): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/posAuth', data);
  }

}
