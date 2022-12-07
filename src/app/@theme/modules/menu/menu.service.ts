import {Injectable, NgZone} from '@angular/core';
import {StorageService} from '../../../@core/utils/storage.service';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {MENUS} from './data';

@Injectable({providedIn: 'root'})
export class MenuService {
  private menus = MENUS;
  private menusStatus = new BehaviorSubject<any>(this.currentMenus);

  constructor(private storage: StorageService) {
  }

  get currentMenus() {
    return this.menus;
  }

  getMenusStatus(): Observable<any> {
    return this.menusStatus.asObservable();
  }

  updateMenusStatus(menus) {
    this.menus = menus;
    this.menusStatus.next(this.menus);
  }
}
