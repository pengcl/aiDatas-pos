import {Component, Input, NgZone, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {AppService} from '../../../../../app.service';
import {AuthService} from '../../../../../pages/auth/auth.service';
import {ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CheckAuth} from '../../../../../@core/utils/check-auth';

@Component({
  selector: 'app-menu-extra',
  templateUrl: 'extra.html',
  styleUrls: ['extra.scss'],
  providers: [NzMessageService]
})
export class MenuExtraComponent {
  aidaShell = (window as any).aidaShell;
  @Input() name = '';
  @Input() items = '';
  @Output() done: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone,
              private router: Router,
              private appSvc: AppService,
              public authSvc: AuthService,
              private modalController: ModalController,
              private message: NzMessageService,
              private checkAuth: CheckAuth) {

  }

  // 开钱箱
  openTill() {
    this.done.next();
    const authparams = {
      authFuctionCode: 'operOpenMenBox',
      uidAuthFuction: 'openTill',
      authFuctionName: '',
      authFuctionType: '4',
      checkCart: true
    };
    this.checkAuth.auth(authparams, null, () => {
      this.openCashBox();
    });
  }

  link(url) {
    this.done.next();
    if (this.appSvc.currentLoading) {
      return false;
    }
    const map = {
      '/refund': {uidAuthFuction: 'retreatTicket', authFuctionCode: 'operRefund'},
      '/supplement': {uidAuthFuction: 'supplement', authFuctionCode: 'operSupTicket'},
      '/reprint': {uidAuthFuction: 'rePrint', authFuctionCode: 'operRePrint'}
    };
    const obj = map[url];
    if (obj) {
      obj.checkCart = true;
      obj.authFuctionType = '4';
      this.checkAuth.auth(obj, url, () => {
        this.redirectPage(url);
      });
    } else {
      this.redirectPage(url);
    }
  }

  redirectPage(url) {
    this.zone.run(() => {
      this.router.navigate([url]).then();
    });
  }

  openCashBox() {
    try {
      this.aidaShell.openCashBox('COM1'); // 开钱箱
    } catch (e) {
      console.log(e.message); // so aidaShell is undefined
    }
  }

}
