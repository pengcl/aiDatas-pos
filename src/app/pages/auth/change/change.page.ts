import {Component, NgZone} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {StorageService} from '../../../@core/utils/storage.service';
import {AuthService} from '../auth.service';
import {AppService} from '../../../app.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-auth-change',
  templateUrl: './change.page.html',
  styleUrls: ['../auth.scss', './change.page.scss'],
  providers: [NzMessageService]
})
export class AuthChangePage {
  aidaShell = (window as any).aidaShell;
  form: FormGroup = new FormGroup({
    uidAccount: new FormControl(this.authSvc.currentUid, [Validators.required]),
    oldPassword: new FormControl('', [Validators.required]),
    newPwd: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required])
  });

  constructor(private zone: NgZone,
              private router: Router,
              private location: LocationStrategy,
              private modalController: ModalController,
              private storageSvc: StorageService,
              private authSvc: AuthService,
              private appSvc: AppService,
              private message: NzMessageService,
              private storage: StorageService) {
  }

  ionViewDidEnter() {
  }

  ionViewDidLeave() {
  }

  checkpassword(v) {
    const reg1 = /^[A-Z|a-z|0-9]{6,16}$/;
    if (!reg1.test(v)) {
      return false;
    } else {
      return true;
    }
  }

  update() {
    if (this.form.invalid) {
      return false;
    }
    const params = this.form.value;
    let flag = this.checkpassword(params.oldPassword);
    if (!flag) {
      this.message.error('密码由6~16位字符或者数字组成');
      return;
    }
    flag = this.checkpassword(params.newPassword);
    if (!flag) {
      this.message.error('密码由6~16位字符或者数字组成');
      return;
    }
    flag = this.checkpassword(params.newPwd);
    if (!flag) {
      this.message.error('密码由6~16位字符或者数字组成');
      return;
    }
    if (params.newPassword !== params.newPwd) {
      this.message.error('两次密码输入不一致');
      return;
    }
    params.notErrorInterceptor = true;
    if (this.aidaShell) {
      this.aidaShell.encryptSensitiveInfo((status, err, data) => {
        params.newPassword = data;
        params.newPwd = data;
        this.aidaShell.encryptSensitiveInfo((status2, err2, data2) => {
          params.oldPassword = data2;
          this.updateInvoke(params);
        }, params.oldPassword);
      }, params.newPassword);
    } else {
      this.updateInvoke(params);
    }
  }

  updateInvoke(params) {
    this.authSvc.update(params).subscribe(res => {
      // 设置用户Token信息
      if (res.status.status === 102041) {
        this.message.error('原密码不正确');
      } else if (res.status.status === 0) {
        this.storage.clear();
        try {
          this.aidaShell.saveDataToCache('', 'token', '');
        } catch (e) {
          console.log(e.message);
        }
        this.zone.run(() => {
          this.router.navigate(['/auth']).then();
        });
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  back() {
    this.zone.run(() => {
      // this.router.navigate(['/ticket/index']).then();
      this.location.back();
    });
  }

}
