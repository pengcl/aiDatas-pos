import { Component, NgZone, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../../../@core/utils/storage.service';
import { AuthService } from '../auth.service';
import { AppService } from '../../../app.service';
import { ShoppingCartService } from '../../shopping-cart/shopping-cart.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CinemasComponent } from '../components/cinemas/cinemas';

import { getPassword } from '../../../@core/utils/extend';
import { ToastService } from '../../../@theme/modules/toast';

const aidaShell = (window as any).aidaShell;

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.scss', './login.page.scss'],
  providers: [NzMessageService]
})

export class AuthLoginPage {
  form: FormGroup = new FormGroup({
    orgAlias: new FormControl('', [Validators.required]),
    accountLoginName: new FormControl('', [Validators.required]),
    accountLoginPassword: new FormControl('', [Validators.required]),
    remember: new FormControl(false, [Validators.required])
  });
  cinema;
  clickLoginBtn = false;
  @ViewChild('orgAlias', {static: false}) orgAlias: ElementRef;
  @ViewChild('accountLoginName', {static: false}) accountLoginName: ElementRef;
  @ViewChild('accountLoginPassword', {static: false}) accountLoginPassword: ElementRef;
  loading = false;

  constructor(private zone: NgZone,
              private router: Router,
              private modalController: ModalController,
              private storageSvc: StorageService,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private appSvc: AppService,
              private shoppingCartSvc: ShoppingCartService) {
    const remember = this.authSvc.remember;
    let alias = [];
    if (this.authSvc.getCurrentUserOrgAlias()) {
      alias = JSON.parse(this.authSvc.getCurrentUserOrgAlias());
    }
    if (alias.length > 0) {
      this.form.get('orgAlias').setValue(alias[0]);
    }
    if (remember === 'true') {
      if (this.authSvc.currentUser) {
        this.form.get('accountLoginName').setValue(this.authSvc.currentUser);
      }
      if (this.authSvc.password) {
        this.form.get('accountLoginPassword').setValue(this.authSvc.password);
      }
      this.form.get('remember').setValue(true);
    } else {
      this.form.get('accountLoginName').setValue('');
      this.form.get('accountLoginPassword').setValue('');
      this.form.get('remember').setValue(false);
      this.storageSvc.clear();
    }
  }

  ionViewDidEnter() {
    if (aidaShell) {
      aidaShell.fullScreenApplication();
    }
  }

  ionViewDidLeave() {
  }

  getSystemSetting(cinemaCode, loginStatus) {
    this.toastSvc.loading('正在登录...', 20000);
    this.appSvc.config({cinemaCode, teminalCode: loginStatus.terminalCode}).subscribe(res => {
      console.log(res);
      this.toastSvc.hide();
      if (!loginStatus.remember) {
        this.form.get('accountLoginName').setValue('');
        this.form.get('accountLoginPassword').setValue('');
      }
      if (res.status.status === 0) {
        // 弹出系统设置界面
        if (aidaShell && (res.data === null || (res.data && res.data.length === 0))) {
          // window.location.href = '/setting/index';
          this.zone.run(() => {
            this.router.navigate(['/setting/index']).then();
          });
          return false;
        }
        this.appSvc.updateSettingStatus(res.data);
        let url = this.appSvc.currentDefaultUrl;
        const queryParams: any = {};
        // 加载异常单
        this.shoppingCartSvc.load({}).subscribe(_res => {
          if (_res.status.status === 0) {// 成功
            if (_res.data && _res.data.uidShopCart) {
              this.shoppingCartSvc.setCurrentCart(_res.data.uidShopCart);
              queryParams.uidShopCart = this.shoppingCartSvc.currentCart;
              queryParams.businessType = 'SALE';
              url = '/checkout/index';
            }
            this.zone.run(() => {
              this.router.navigate([url], {queryParams}).then();
            });
          }
        });
        // window.location.href = '/ticket/index';
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  async presentModal(cinemas, loginStatus) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: CinemasComponent,
      componentProps: {cinemas},
      cssClass: 'full-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.cinema = data;
      loginStatus.cinema = this.cinema;
      this.authSvc.updateLoginStatus(loginStatus);
      this.getSystemSetting(this.cinema.cinemaCode, loginStatus);
    }
  }

  change(target, e) {
    this.form.get(target).setValue(e);
  }

  keyChange(target, e) {
    const keys = ['orgAlias', 'accountLoginName', 'accountLoginPassword'];
    let index = keys.indexOf(target);
    if (e === 'prev') {
      index = index - 1;
    } else {
      index = index + 1;
    }
    const key = keys[index];
    this[key].elementRef.nativeElement.click();

  }

  login() {
    if (this.form.invalid) {
      return false;
    }
    if (this.loading) {
      return false;
    }
    this.loading = true;
    if (this.clickLoginBtn) {
      return;
    }
    setTimeout(() => {
      this.clickLoginBtn = false;
    }, 2000);
    const body = {
      orgAlias: this.form.get('orgAlias').value,
      accountLoginName: this.form.get('accountLoginName').value,
      accountLoginPassword: '',
      notErrorInterceptor: true
    };
    const pass = this.form.get('accountLoginPassword').value;
    if (aidaShell) {
      // alert("aidaShell->pass: " + pass);
      aidaShell.encryptSensitiveInfo((status, err, data) => {
        // alert("encryptInfoCallback: " + status + " # " + err + " # " + data);
        body.accountLoginPassword = data;
        this.zone.run(() => {
          this.loginInvoke(body);
        });
      }, pass);
    } else {
      body.accountLoginPassword = getPassword(this.form.get('accountLoginPassword').value);
      this.loginInvoke(body);
    }
  }

  loginInvoke(body) {
    this.toastSvc.loading('正在登录...', 20000);
    console.log('this..', this);
    this.authSvc.login(body).subscribe(res => {
      this.loading = false;
      this.toastSvc.hide();
      // 设置用户Token信息
      if (res.status.status === 0) {
        if (!res.data.cinemaDTOList || res.data.cinemaDTOList.length === 0) {
          this.message.remove();
          this.message.error('该用户未授权影院，登录失败。');
          return;
        }
        this.cinema = res.data.cinemaDTOList[0];
        const loginStatus = {
          aliasList: [this.form.get('orgAlias').value],
          token: res.data.token,
          name: this.form.get('accountLoginName').value,
          staffName: res.data.staffName,
          password: this.form.get('accountLoginPassword').value,
          remember: this.form.get('remember').value,
          cinema: this.cinema,
          uidOrg: res.data.uidOrg,
          terminalCode: this.form.get('accountLoginName').value,
          uid: res.data.uid,
          roles: res.data.purviewList,
          isPosAuth: res.data.isPosAuth,
          isAdmin: res.data.isCreateByCloudUser
        };
        if (aidaShell) {
          aidaShell.saveDataToCache('', 'token', res.data.token);
          aidaShell.setCardCustomPwd((status, err) => {
          }, 'OrstMemberCard', 3, '383333333030');
        }
        this.appSvc.getMac().subscribe(mac => {
          if (mac) {
            loginStatus.terminalCode = mac;
            this.appSvc.updateMac(mac);
          }
          if (res.data.cinemaDTOList.length > 1) {
            this.presentModal(res.data.cinemaDTOList, loginStatus).then();
          } else {
            this.authSvc.updateLoginStatus(loginStatus);
            this.getSystemSetting(this.cinema.cinemaCode, loginStatus);
          }
        });
      } else {
        this.message.remove();
        this.message.error('登录失败：' + res.status.msg2Client);
      }
    });
  }

  // 退出返回主界面
  logout() {
    try {
      aidaShell.maximizeApplication();
      aidaShell.backToEntryPage();
    } catch (e) {
      console.log(e.message);
    }
  }

}
