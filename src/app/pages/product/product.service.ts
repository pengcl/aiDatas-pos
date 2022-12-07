import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';

import {RequestService} from '../../@core/utils/request.service';
import {PageDto} from '../../@core/utils/extend';
import {AddItemsInputDto} from '../checkout/checkout.service';
import {AppService} from '../../app.service';
import {AuthService} from '../auth/auth.service';

export declare interface AllProductsInputDto {
  cinemaCode: string;
  page: PageDto;
  terminalCode: string;
  uidBaseCategory: 2;
}

export declare interface ProductsInputDto {
  cinemaCode: string;
  notShowUnenable: 1;
  page: PageDto;
  terminalCode: string;
  uidBaseCategory?: any;
  uidComp: string;
  uidPosCategory?: number;
}

export declare interface CatalogsInputDto {
  cinemaCode: string;
  uidComp: string;
}

export declare interface PackageInputDto {
  uid: string;
  uidComp?: string;
}

@Injectable({providedIn: 'root'})
export class ProductService {
  selected: AddItemsInputDto[] = [];
  selectedStatus: BehaviorSubject<any> = new BehaviorSubject<any>(this.currentSelected);

  constructor(private requestSvc: RequestService, private appSvc: AppService, private authSvc: AuthService) {
  }

  catalogs(data: CatalogsInputDto): Observable<any> {
    return this.requestSvc.send('/merService-api/merCategoryPos/list', data);
  }

  all(data: AllProductsInputDto): Observable<any> {
    return this.requestSvc.send('/posResuorceService-api/pos/getComboList', data);
  }

  items(data: ProductsInputDto): Observable<any> {
    return this.requestSvc.send('/posResuorceService-api/pos/getPosByCategory', data);
  }

  package(data: PackageInputDto): Observable<any> {
    return this.requestSvc.send('/posResuorceService-api/pos/getComboDetail', data);
  }

  search(search: string): Observable<any> {
    const data = {
      search,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      terminalCode: this.authSvc.currentTerminalCode
    };
    return this.requestSvc.send('/posResuorceService-api/pos/getPosResource', data);
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
