import {Injectable} from '@angular/core';
import {RequestService} from '../../../../../../../@core/utils/request.service';
import {BehaviorSubject, Observable} from 'rxjs';

import {ShoppingCartService} from '../../../../../../shopping-cart/shopping-cart.service';

declare interface RefreshSeatsInputDto {
  terminalCode: string;
  uidComp: string;
  uidField: string;
  uidPlan: string;
  uidPosShopCart: string;
}

@Injectable({providedIn: 'root'})
export class SeatsService {
  private refreshing = false;
  private refreshingStatus = new BehaviorSubject<any>(this.currentRefreshing);
  constructor(private requestSvc: RequestService, private shoppingCartSvc: ShoppingCartService) {
  }

  refresh(data: RefreshSeatsInputDto): Observable<any> { // 影片列表
    return this.requestSvc.send('/posResuorceService-api/pos/refreshPosSeats', data);
  }

  delay(): Observable<any> { // 延时锁座
    const data = {uid: this.shoppingCartSvc.currentCart};
    return this.requestSvc.send('/orderService-api/posShopCart/delayedCart', data);
  }

  getRefreshingStatus(): Observable<any> {
    return this.refreshingStatus.asObservable();
  }

  get currentRefreshing() {
    return this.refreshing;
  }

  updateRefreshingStatus(status: boolean) {
    this.refreshing = status;
    this.refreshingStatus.next(this.refreshing);
  }
}
