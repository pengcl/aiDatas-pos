import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../../../@core/utils/request.service';
import {PageDto} from '../../modules/pagination/pagination.dto';
import {AppService} from '../../../app.service';
import {ShoppingCartService} from '../../../pages/shopping-cart/shopping-cart.service';

export interface ItemsInputDto {
  page?: PageDto;
  uidComp?: string;
  uidMemberCardLevel: string;
  uidPosResSeat: string;
}

export interface ChangeInputDto {
  cartSeatPriceService: number;
  cartSeatPriceSupplyValue: number;
  namePayMode: null;
  ticketName: string;
  ticketPirce: number;
  uidCart?: string;
  uidCartPlanSeat: string;
  uidPayMode: null;
  uidTicketType: string;
}

@Injectable({providedIn: 'root'})
export class TicketChangeTypeService {

  constructor(private requestSvc: RequestService, private appSvc: AppService, private shoppingCartSvc: ShoppingCartService) {
  }

  create(data): Observable<any> {
    return this.requestSvc.send('/orderService-api/posReserve/create', data);
  }

  items(data: ItemsInputDto): Observable<any> {
    const page = {
      currentPage: 1,
      pageSize: 999
    };
    data.page = page;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/posResuorceService-api/pos/getPosSeatTickType', data);
  }

  change(data: ChangeInputDto): Observable<any> {
    data.uidCart = this.shoppingCartSvc.currentCart;
    return this.requestSvc.send('/orderService-api/posShopCart/ticketReplacementClass', data);
  }
}
