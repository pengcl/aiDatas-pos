import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {StorageService} from '../../../@core/utils/storage.service';
import {AuthService} from '../auth.service';
import {AppService} from '../../../app.service';

import {getPassword} from '../../../@core/utils/extend';
import {ToastService} from '../../../@theme/modules/toast';

@Component({
  selector: 'app-auth-lock',
  templateUrl: './lock.page.html',
  styleUrls: ['../auth.scss', './lock.page.scss']
})
export class AuthLockPage implements OnInit {
  aidaShell;
  form: FormGroup = new FormGroup({
    accountLoginName: new FormControl('', [Validators.required]),
    accountLoginPassword: new FormControl('', [Validators.required]),
    orgAlias: new FormControl('', [Validators.required])
  });
  @ViewChild('loginpd', {static: false}) private loginpd: ElementRef;

  constructor(private zone: NgZone,
              private router: Router,
              private location: LocationStrategy,
              private modalController: ModalController,
              private storageSvc: StorageService,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private appSvc: AppService) {
    this.form.get('accountLoginName').setValue(this.authSvc.currentUser);
    const alias = JSON.parse(this.authSvc.getCurrentUserOrgAlias());
    this.form.get('orgAlias').setValue(alias[0]);
  }

  ngOnInit() {
    setTimeout(() => {
      this.loginpd.nativeElement.focus();
    }, 200);
    this.zone.run(() => {
      this.aidaShell = (window as any).aidaShell;
    });
  }

  loginInvoke(body) {
    this.zone.run(() => {
      this.toastSvc.loading('正在处理...', 20000);
      this.authSvc.lockLogin(body).subscribe(res => {
        this.toastSvc.hide();
        // 设置用户Token信息
        if (res.status.status === 0) {
          this.location.back();
        }
      });
    });
  }

  login() {
    if (this.form.invalid) {
      return false;
    }
    const body = {
      orgAlias: this.form.get('orgAlias').value,
      accountLoginName: this.form.get('accountLoginName').value,
      accountLoginPassword: this.form.get('accountLoginPassword').value
    };
    if (this.aidaShell) {
      this.zone.run(() => {
        this.aidaShell.encryptSensitiveInfo((status, err, data) => {
          body.accountLoginPassword = data;
          this.loginInvoke(body);
        }, body.accountLoginPassword);
      });
    } else {
      body.accountLoginPassword = getPassword(body.accountLoginPassword);
      this.loginInvoke(body);
    }
  }

  clear() {
    this.form.get('accountLoginPassword').setValue('');
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

}
