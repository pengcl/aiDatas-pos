import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

import {RequestService} from '../../@core/utils/request.service';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';

export interface ListInputDto {
  channelCode: string;
  cinemaCode: string;
  type: string;
  uidComp: string;
}

export interface TicketDetailInputDto {
  ticketCode: string;
}

export interface DetailInputDto {
  amount: string;
  setCode: string;
  ticketDetails: TicketDetailInputDto[];
}

export interface CheckInputDto {
  channelCode: string;
  cinemaCode: string;
  orderCode: string;
  saleTime: string;
  salesDetails: DetailInputDto[];
  uidComp: string;
  uidOrg: string;
}

export interface TicketOutputDto {
  checkResult: string;
  ticketCode: string;
  ticketName: null | string;
  ticketPrice: null | string;
  validityPeriod: null | string;
  isChecked: boolean;
}

export interface ContainInputDto {
  ticketCode: string;
  ticketName: string;
  ticketPrice: string;
  validDateStr: string;
  validDate?: string;
}

export interface TicketListInputDto {
  cartTicketContainDTOList: ContainInputDto[];
  ticketCode: string;
  ticketName: string;
  ticketPrice: string;
  validDateStr?: string;
}

export interface CreateInputDto {
  cartTicketList: TicketListInputDto[];
  cinemaCode?: string;
  terminalCode?: string;
}

export interface TicketInputDto {
  discountAmount: number;
  merUid: string;
}

export interface GiveInputDto {
  memberMobile: string;
  memberCard: string;
  ticketGifts: TicketInputDto[];
  cinemaCode?: string;
  uidComp?: string;
}


@Injectable({providedIn: 'root'})
export class CouponService {
  private selected = [];
  private selectedStatus = new BehaviorSubject<any>(this.currentSelected);

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private http: HttpClient,
              private requestSvc: RequestService,
              private authSvc: AuthService,
              private appSvc: AppService) {
  }

  list(): Observable<any> {
    const data: ListInputDto = {
      channelCode: 'QIANTAI',
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      type: '4',
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/ticketService-api/ticket/ticketsTransactionsList', data);
  }

  check(inputDto: DetailInputDto[]): Observable<any> {
    const data: CheckInputDto = {
      channelCode: 'QIANTAI',
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      orderCode: '2111',
      saleTime: '2018-08-07 00:00:00',
      salesDetails: inputDto,
      uidComp: this.appSvc.currentCinema.uidComp,
      uidOrg: this.authSvc.currentUidOrg
    };
    return this.requestSvc.send('/ticketService-api/ticket/ticketsTransactionsChecksales', data);
  }

  create(cartTicketList: TicketListInputDto[]): Observable<any> {
    const data: CreateInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      terminalCode: this.authSvc.currentTerminalCode,
      cartTicketList
    };
    return this.requestSvc.send('/orderService-api/posShopCart/createCartTicket', data);
  }

  get currentSelected() {
    return this.selected;
  }

  getSelectedStatus(): Observable<any> {
    return this.selectedStatus.asObservable();
  }

  updateSelectedStatus(selected) {
    this.selected = selected;
    this.selectedStatus.next(this.selected);
  }
}
