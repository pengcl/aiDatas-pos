import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

import {RequestService} from '../../@core/utils/request.service';


@Injectable({providedIn: 'root'})
export class RechargeService {

  constructor(@Inject('PREFIX_URL') private PREFIX_URL, private http: HttpClient,
              private requestSvc: RequestService) {
  }
}
