import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {RequestService} from '../../@core/utils/request.service';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';

export declare interface TeminalParamItemInputDto {
  keyCode: string;
  value: string;
  valueCode: string;
  valueName: string;
}

export declare interface SaveInputDto {
  teminalParamList: TeminalParamItemInputDto[];
  uidComp?: string;
  cinemaCode?: string;
  teminalCode?: string;
}

@Injectable({providedIn: 'root'})
export class SettingService {

  constructor(private requestSvc: RequestService,
              private appSvc: AppService,
              private authSvc: AuthService) {
  }

  save(data: SaveInputDto): Observable<any> {
    return this.requestSvc.send('/dataDictionaryService-api/posDicTerConfig/save', data);
  }

  dic(): Observable<any> {
    const data = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      teminalCode: this.authSvc.currentTerminalCode
    };
    return this.requestSvc.send('/dataDictionaryService-api/posDicTerConfig/queryTeminalDic', data);
  }

  comps(): Observable<any> {
    const data = {
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/merService-api/wareHouse/getListByUidComp', data);
  }
}
