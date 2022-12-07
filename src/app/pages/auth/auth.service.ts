import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';

import {StorageService} from '../../@core/utils/storage.service';

import {RequestService} from '../../@core/utils/request.service';

@Injectable({providedIn: 'root'})
export class AuthService {
  public loginRedirectUrl: string;
  private loginStatus = new Subject<boolean>();
  private roles = [];

  constructor(private zone: NgZone,
              private router: Router,
              private storage: StorageService,
              private requestSvc: RequestService) {
  }

  requestAuth() {
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

  login(data): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/posLogin', data);
  }

  update(data): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/updatePassword', data);
  }

  logout(data): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/poslogout', data);
  }

  lockLogin(data): Observable<any> {
    return this.requestSvc.send('/organizationManageService-api/account/lockLogin', data);
  }

  get currentUser() {
    return this.storage.get('name');
  }

  get currentStaff() {
    return this.storage.get('staffName');
  }

  get currentRoles() {
    return JSON.parse(this.storage.get('roles'));
  }

  get currentUid() {
    return this.storage.get('uid');
  }

  get currentToken() {
    return this.storage.get('token');
  }

  get currentTerminalCode() {
    return this.storage.get('terminalCode');
  }

  get currentUidOrg() {
    return this.storage.get('uidOrg');
  }

  get remember() {
    return this.storage.get('remember');
  }

  get password() {
    return this.storage.get('password');
  }

  get isLogged(): boolean {
    this.loginStatus.next(!!this.currentToken);
    return !!this.currentToken;
  }

  getLoginStatus(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }

  updateLoginStatus(data) {
    for (const key in data) {
      if (typeof data[key] === 'object') {
        this.storage.set(key, JSON.stringify(data[key]));
      } else {
        this.storage.set(key, data[key]);
      }
    }
    this.loginStatus.next(this.isLogged);
  }

  getCurrentUserOrgAlias() {
    return this.storage.get('aliasList');
  }

  role(code) {
    const roles = this.currentRoles;
    const isAdmin = this.isAdmin + '';
    if (roles) {
      if (code === '-1') {
        return true;
      }
      if (code === '702' && isAdmin === '1') {
        return false;
      }
      return roles.indexOf(code) !== -1;
    } else {
      this.storage.clear();
      this.zone.run(() => {
        this.router.navigate(['/auth/login']).then();
      });
    }
  }

  get currentPosAuth() {
    return this.storage.get('isPosAuth');
  }

  get isAdmin() {
    return this.storage.get('isAdmin');
  }

}
