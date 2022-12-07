import {Injectable} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';

import {RequestService} from '../../@core/utils/request.service';
import {PageDto} from '../../@theme/modules/pagination/pagination.dto';

export interface CardsInputDto {
  batchCode?: string;
  cardStatus?: string; // 0:未绑定，1:已绑定
  page?: PageDto;
  uidCardLevel?: string;
  uidComp?: string;
  cardType?: string;
}

export interface CreateInputDto {
  cardNo: string;
  memberMobile: string;
  actualCash: string;
  cardLevelType: number;
  expense: number;
  isDisable: boolean;
  memberAlias: string;
  memberBirthDay: string;
  memberBirthMonth: string;
  memberEmail: string;
  memberIdCard: string;
  memberPassword: string;
  memberQQ: string;
  memberSex: string;
  memberWX: string;
  remainMoneyCash: number;
  uid: string;
  uidCampaign: string;
  uidCardLevel: string;
  uidMemberCard: string;
  uidComp?: string;
  cinemaCode?: string;
  terminalCode?: string;
}


@Injectable({providedIn: 'root'})
export class CardService {
  aidaShell = (window as any).aidaShell;

  constructor(private appSvc: AppService,
              private authSvc: AuthService,
              private requestSvc: RequestService) {
  }

  info(cardNo): Observable<any> {
    const settings = this.appSvc.currentSettings;
    let cardTypeSetting = '';
    const data: any = {};
    data.bussinessType = 0;
    settings.forEach(setting => {
      if (setting.keyCode === 'cardType') {
        cardTypeSetting = setting.valueCode;
      }
    });
    if (cardTypeSetting === 'CommonIdCard') {
      data.cardType = 2; // ID卡
      data.cardNoPhysical = cardNo;
    } else {
      data.cardType = 1; // IC卡
      data.cardNo = cardNo;
    }
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.notErrorInterceptor = true;
    return this.requestSvc.send('/memberService-api/member/readCard', data);
  }

  phoneCheck(memberMobile): Observable<any> {
    const data: any = {memberMobile};
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/phoneIfRegister', data);
  }

  create(data: CreateInputDto): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.terminalCode = this.authSvc.currentTerminalCode;
    return this.requestSvc.send('/memberService-api/member/create', data);
  }

  cards(data: CardsInputDto): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/memberCard/list', data);
  }

  levels(): Observable<any> {
    const data = {uidComp: this.appSvc.currentCinema.uidComp, status: 0};
    return this.requestSvc.send('/memberService-api/memberCardLevel/queryMenberCardList', data);
  }

  writeOrBind(uid, cardNoPhysical) {
    const data = {uid, cardNoPhysical, cardType: '2'};
    return this.requestSvc.send('/memberService-api/memberCard/writeCardOrBind', data);
  }

  read(): Observable<any> {
    const currentSettings = this.appSvc.currentSettings;
    const reader = currentSettings.filter(item => item.keyCode === 'cardReader')[0];
    if (this.aidaShell) {
      return new Observable((observe) => {
        return this.aidaShell.readCardSerialNum((status, msg, data) => {
          if (status === 0) {
            observe.next(data);
          } else {
            observe.next(null);
          }
          observe.complete();
        }, reader.valueCode);
      });
    } else {
      return observableOf(null);
    }
  }

  readId(): Observable<any> {
    const currentSettings = this.appSvc.currentSettings;
    const reader = currentSettings.filter(item => item.keyCode === 'cardReader')[0];
    const type = currentSettings.filter(item => item.keyCode === 'cardType')[0];
    if (this.aidaShell) {
      return new Observable((observe) => {
        this.aidaShell.readCardMemberID((status0, err0, data0) => {
          // alert(status0 + ':' + err0 + ':' + data0);
          if (status0 !== 0) {
            this.setCardPwd(2);
            this.aidaShell.readCardMemberID((status1, err1, data1) => {
              // alert(status1 + ':' + err1 + ':' + data1);
              if (status1 !== 0) {
                this.setCardPwd(0);
                this.aidaShell.readCardMemberID((status2, err2, data2) => {
                  // alert(status2 + ':' + err2 + ':' + data2);
                  this.setCardPwd(1);
                  observe.next(data2);
                  observe.complete();
                }, type.valueCode, reader.valueCode);
              } else {
                this.setCardPwd(1);
                observe.next(data1);
                observe.complete();
              }
            }, type.valueCode, reader.valueCode);
          } else {
            observe.next(data0);
            observe.complete();
          }
        }, type.valueCode, reader.valueCode);
      });
    } else {
      return observableOf(null);
    }
  }

  // ==============设置IC卡读写密码============ //
  setCardPwd(flag) {
    switch (flag) {
      case 0:
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 1, 'FFFFFFFFFFFF');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 2, 'FFFFFFFFFFFF');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 3, 'FFFFFFFFFFFF');
        break;
      case 1:
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 3, '383333333030');
        break;
      case 2:
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 1, '383333333030');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 2, '383333333030');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 3, '383333333030');
        break;
    }
  }
}
