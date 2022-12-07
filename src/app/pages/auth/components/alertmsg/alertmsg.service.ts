import {Inject, Injectable} from '@angular/core';
import {RequestService} from '../../../../@core/utils/request.service';


@Injectable({providedIn: 'root'})
export class AlertmsgService {

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private requestSvc: RequestService) {
  }

}
