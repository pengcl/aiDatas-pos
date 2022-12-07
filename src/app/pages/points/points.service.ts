import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

import {RequestService} from '../../@core/utils/request.service';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';
import {AddItemsInputDto} from '../checkout/checkout.service';

export interface UpdateCountInputDto {
  calculationType: '0' | '1';
  cinemaCode?: string;
  isCombo: 0 | 1;
  isPointsPay: number;
  number: number;
  totalPoints: number;
  uidPosResource: string;
  uidShopCart?: string;
}

export interface BillMemberInputDto {
  uidMember: string;
  passWord: string;
}

export interface BillInputDto {
  memberInfo: BillMemberInputDto;
  billSaleType?: string;
  uidShopCart?: string;
  cinemaCode?: string;
  uidComp?: string;
}

@Injectable({providedIn: 'root'})
export class PointsService {
  selected: AddItemsInputDto[] = [];
  selectedStatus: BehaviorSubject<any> = new BehaviorSubject<any>(this.currentSelected);

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private http: HttpClient,
              private requestSvc: RequestService,
              private appSvc: AppService,
              private authSvc: AuthService) {
  }

  items(points): Observable<any> {
    const data: any = {
      points,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      teminalCode: this.authSvc.currentTerminalCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    return this.requestSvc.send('/posResuorceService-api/pos/getPosPointsResource', data);
  }

  updateCount(data: UpdateCountInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/posShopCart/batchDeleteResAndSeat', data);
  }

  bill(memberInfo: BillMemberInputDto, uidShopCart): Observable<any> {
    const data: BillInputDto = {
      memberInfo,
      uidShopCart
    };
    data.billSaleType = 'SALE';
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/orderService-api/billManagement/pos/v1/createMemberPointBill', data);
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
