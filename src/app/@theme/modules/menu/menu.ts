import { Component, NgZone, AfterViewInit, ViewChild } from '@angular/core';
import { CacheService } from '../../../@core/utils/cache.service';
import { ToastService } from '../toast';
import { AuthService } from '../../../pages/auth/auth.service';
import { IonHeader, ModalController } from '@ionic/angular';
import { fromEvent } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../../@core/utils/storage.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DialogService } from '../dialog';
import { AppService } from '../../../app.service';
import { ShoppingCartService } from '../../../pages/shopping-cart/shopping-cart.service';
import { MENUS } from './data';
import { checkRedirect } from '../../../@core/utils/extend';
import { CheckAuth } from '../../../@core/utils/check-auth';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.html',
  styleUrls: ['menu.scss'],
  providers: [NzModalService, NzMessageService]
})
export class MenuComponent implements AfterViewInit {
  aidaShell = (window as any).aidaShell;
  items = [];
  length;
  extraMenus = [];
  @ViewChild(IonHeader) private ionHeader: any;
  name;

  constructor(private zone: NgZone,
              private toastSvc: ToastService,
              private cacheSvc: CacheService,
              public authSvc: AuthService,
              private appSvc: AppService,
              private modalController: ModalController,
              private shoppingCartSvc: ShoppingCartService,
              private nzmodal: NzModalService,
              private message: NzMessageService,
              private router: Router,
              private dialogSvc: DialogService,
              private storage: StorageService,
              private checkAuth: CheckAuth) {
    const width = window.innerWidth;
    let items = [];
    this.setLength(width);
    fromEvent(window, 'resize').subscribe((event) => {
      this.setLength(width);
    });
    items = MENUS.filter(item => {
      return this.authSvc.role(item.role);
    });
    this.appSvc.getSettingStatus().subscribe(res => {
      // 判断是否设置销售 影票、卖品
      if (res) {
        const ticketSetting = res.filter(item => {
          return item.keyCode === 'terSaleScoTicket';
        })[0];
        const productSetting = res.filter(item => {
          return item.keyCode === 'terSaleScoMer';
        })[0];
        items = items.filter(item => !(ticketSetting && ticketSetting.value !== '1' && item.role === '70'));
        items = items.filter(item => !(productSetting && productSetting.value !== '1' && item.role === '71'));
      }
    });
    this.items = items;
    this.extraMenus = items.slice(this.length);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.name = event.url.split('/')[1];
      }
    });
  }

  ngAfterViewInit() {
  }

  link(url) {
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

  askForLock() {
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.status) {
        this.link('/auth/lock');
      } else {
        this.message.warning('购物车还有商品，请先结算！');
      }
    });
  }

  askForLogout() {
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.status) {
        this.logout();
      } else {
        this.message.warning('购物车还有商品，请先结算！');
      }
    });
  }

  setLength(width) {
    this.length = Math.floor(width / 120);
  }

  // 最小化
  minSize() {
    try {
      this.aidaShell.minimizeApplication();
    } catch (e) {
      console.log(e.message); // so aidaShell is undefined
    }
  }

  // 退出系统
  logout() {
    this.dialogSvc.show({content: '确定要退出系统？', confirm: '是', cancel: '否'}).subscribe(result => {
      if (result.value) {
        this.setLogout();
        window.location.href = '/auth/login';
      }
    });
  }

  setLogout() {
    this.authSvc.logout({}).subscribe(res => {
      if (res.status.status !== 0) {
        this.message.remove();
        this.message.error(res.status.msg2Client);
      }
      this.storage.clear();
      this.cacheSvc.set('token', '');
    });
  }

// 开钱箱
  openTill() {
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

  openCashBox() {
    try {
      this.aidaShell.openCashBox('COM1'); // 开钱箱
    } catch (e) {
      console.log(e.message); // so aidaShell is undefined
    }
  }

}
