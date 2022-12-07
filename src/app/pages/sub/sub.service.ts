import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {StorageService} from '../../@core/utils/storage.service';
import {RequestService} from '../../@core/utils/request.service';
import {BehaviorSubject, Observable} from 'rxjs';

export interface SubDto {
  page?: string;
  updateTime?: string;
  plan?: any;
  regions?: any[];
  seats?: any[];
  floors?: any[];
  info?: any;
  open?: boolean;
  type?: string;
  date?: any;
  plans?: any[];
  components?: {
    film: {
      films: any[];
      plans: any[];
      film: any;
      page: any;
      type: any;
    },
    hall: {
      halls: any[];
      plans: any[];
      hall: any;
      page: any;
      type: any;
    },
    time: {
      times: any[];
      plans: any[];
      time: any;
      page: any;
      type: any;
    }
  };
}

@Injectable({providedIn: 'root'})
export class SubService {
  pics;
  open: false;
  private sub: SubDto = {
    page: 'ticket',
    updateTime: new Date().getTime().toString(),
    plan: null,
    regions: [],
    seats: [],
    floors: [],
    info: null,
    open: false,
    type: 'film',
    date: new Date(),
    plans: [],
    components: {
      film: {
        films: [],
        plans: [],
        film: null,
        page: {
          group: {
            currentPage: 1,
            pageSize: 4
          },
          items: {
            currentPage: 1,
            pageSize: 40
          }
        },
        type: 'group'
      },
      hall: {
        halls: [],
        plans: [],
        hall: null,
        page: {
          group: {
            currentPage: 1,
            pageSize: 4
          },
          items: {
            currentPage: 1,
            pageSize: 32
          }
        },
        type: 'group'
      },
      time: {
        times: [],
        plans: [],
        time: null,
        page: {
          currentPage: 1,
          pageSize: 32
        },
        type: ''
      }
    }
  };
  private subStatus = new BehaviorSubject<any>(this.currentSub);
  private openStatus = new BehaviorSubject<any>(this.currentOpen);
  constructor(private http: HttpClient,
              private router: Router,
              private storage: StorageService,
              private requestSvc: RequestService) {
  }

  customPics(cinemaCode, terminalCode): Observable<any> {
    const data = {
      cinemaCode,
      terminalCode,
      terminalType: 1
    };
    return this.requestSvc.send('/planShowService-api/planShow/queryShowPic', data);
  }

  get currentSub() {
    return this.sub;
  }

  get currentOpen() {
    return this.open;
  }

  getSubStatus(): Observable<any> {
    return this.subStatus.asObservable();
  }

  getOpenStatus(): Observable<any> {
    return this.openStatus.asObservable();
  }

  updateSubStatus(sub) {
    this.sub = sub;
    this.subStatus.next(this.sub);
  }

  updateOpenStatus(open) {
    this.open = open;
    this.openStatus.next(this.open);
  }

  updateSub(key, value) {
    const sub: SubDto = this.currentSub;
    sub[key] = value;
    this.updateSubStatus(sub);
  }

  updateOpen(open) {
    this.updateOpenStatus(open);
  }

  updateSubComponent(key, value) {
    const sub: SubDto = this.currentSub;
    sub.components[key] = value;
    this.updateSubStatus(sub);
  }

}
