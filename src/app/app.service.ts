import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subject, BehaviorSubject, of as observableOf} from 'rxjs';

import {NzMessageService} from 'ng-zorro-antd';
import {StorageService} from './@core/utils/storage.service';
import {RequestService} from './@core/utils/request.service';
import {AuthService} from './pages/auth/auth.service';

@Injectable({providedIn: 'root'})
export class AppService {
  public loginRedirectUrl: string;
  private loading = false;
  private seats;
  private settingStatus = new BehaviorSubject<any>(this.currentSettings);
  private renderStatus = new Subject<any>();
  private loadingStatus = new BehaviorSubject<any>(this.currentLoading);
  fullscreenStatus = new Subject<boolean>();

  constructor(private zone: NgZone,
              private router: Router,
              private message: NzMessageService,
              private authSvc: AuthService,
              private storage: StorageService,
              private requestSvc: RequestService) {
  }

  requestSetting() {
    if (this.router.url.indexOf('auth') !== -1) {
      return false;
    }
    if (this.loginRedirectUrl) {
      return false;
    }

    this.loginRedirectUrl = this.router.url;
    this.zone.run(() => {
      this.router.navigate(['/auth/login']).then();
    });
  }

  config(data: { cinemaCode: string, teminalCode: string }): Observable<any> {
    return this.requestSvc.send('/dataDictionaryService-api/posDicTerConfig/queryTeminalDic', data);
  }

  /*settings(config?) {
    if (config) {
      this.storage.set('systemSet', JSON.stringify(config));
    } else if (config === null) {
      this.storage.remove('systemSet');
    } else {
      const SETTINGS = this.storage.get('systemSet');
      if (SETTINGS) {
        return JSON.parse(SETTINGS);
      } else {
        return '';
      }
    }
  }*/

  checkAuth(code) {
    let auth = null;
    this.currentCinema.teminalAuthOperList.forEach(item => {
      if (item.dicCode === code) {
        auth = item;
      }
    });
    return auth;
  }

  get currentDefaultUrl() {
    const setting = this.currentSettings;
    let url = '/ticket/index';
    const ticketSetting = setting.filter(item => {
      return item.keyCode === 'terSaleScoTicket';
    })[0];
    if (ticketSetting && ticketSetting.value !== '1' || !this.authSvc.role('70')) {
      url = '/product/index';
    }
    return url;
  }

  get currentSettings() {
    const settings = this.storage.get('systemSet');
    return JSON.parse(settings);
  }

  get currentCinema() {
    const cinema = this.storage.get('cinema');
    return JSON.parse(cinema);
  }

  get currentOrg() {
    return this.storage.get('uidOrg');
  }

  get isMixPay() {// 前台同一笔订单是否允许混合支付
    const mixPay = this.currentCinema.teminalList ?
      this.currentCinema.teminalList.filter(item => item.dicCode === 'teminalMixPay')[0] : null;
    return mixPay ? mixPay.dicValue === '1' : false;
  }

  get isStockShow() {// 前台同一笔订单是否允许混合支付
    const stockShow = this.currentCinema.teminalList ?
      this.currentCinema.teminalList.filter(item => item.dicCode === 'teminalShowStock')[0] : null;
    return stockShow ? stockShow.dicValue === '1' : false;
  }

  get isSvcMixPay() {// 前台同一笔订单是否允许多张会员储值卡混合支付
    const mixPay = this.currentCinema.teminalList ?
      this.currentCinema.teminalList.filter(item => item.dicCode === 'teminalMemMixPay')[0] : null;
    return mixPay ? mixPay.dicValue === '1' : false;
  }

  get isBalancePay() {// 前台储值卡会员是否只允许余额支付
    const balancePay = this.currentCinema.teminalList ?
      this.currentCinema.teminalList.filter(item => item.dicCode === 'teminalMemPayOnly')[0] : null;
    return balancePay ? balancePay.dicValue === '1' : false;
  }

  get currentMac() {
    const mac = this.storage.get('mac');
    return mac;
  }

  get isSet(): boolean {
    return !!this.currentSettings;
  }

  get reload() {
    const isReload = this.storage.get('isReload');
    return isReload;
  }

  setReload(isReload) {
    this.storage.set('isReload', isReload);
  }

  removeReload() {
    this.storage.remove('isReload');
  }

  getSettingStatus(): Observable<any> {
    return this.settingStatus.asObservable();
  }

  getRenderStatus(): Observable<boolean> {
    return this.renderStatus.asObservable();
  }

  getLoadingStatus(): Observable<any> {
    return this.loadingStatus.asObservable();
  }

  get currentLoading() {
    return this.loading;
  }

  updateLoadingStatus(status: boolean) {
    this.loading = status;
    this.loadingStatus.next(this.loading);
  }

  updateFullscreenStatus(status: boolean) {
    this.fullscreenStatus.next(status);
  }

  updateSettingStatus(data) {
    this.storage.set('systemSet', JSON.stringify(data));
    this.settingStatus.next(this.currentSettings);
  }

  updateRenderStatus(seats) {
    this.seats = seats;
    this.renderStatus.next(this.seats);
  }

  updateMac(mac) {
    this.storage.set('mac', mac);
  }

  getMac(): Observable<any> {
    const aidaShell = (window as any).aidaShell;
    if (aidaShell) {
      return new Observable((observe) => {
        return aidaShell.getLocalMacAddress((status, msg, data) => {
          if (status === 0) {
            observe.next(data);
          } else {
            this.message.remove();
            this.message.error('获取终端号数据失败，登录终止。');
            observe.next(null);
          }
          observe.complete();
        });
      });
    } else {
      return observableOf(null);
    }
  }
}
