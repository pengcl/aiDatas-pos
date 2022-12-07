import {Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PosAuthService} from './posauth.service';
import {AppService} from '../../../app.service';
import {AuthService} from '../../../pages/auth/auth.service';
import {getPassword} from '../../../@core/utils/extend';
import {NzMessageService} from 'ng-zorro-antd/message';

const aidaShell = (window as any).aidaShell;

@Component({
  selector: 'app-posAuth',
  templateUrl: 'posAuth.html',
  styleUrls: ['../../../../theme/ion-modal.scss', 'posAuth.scss'],
  providers: [NzMessageService]
})
export class PosAuthComponent {
  @ViewChild('accountLoginName', {static: false}) accountLoginName: ElementRef;
  @ViewChild('accountLoginPassword', {static: false}) accountLoginPassword: ElementRef;
  form: FormGroup = new FormGroup({
    accountLoginName: new FormControl('', [Validators.required]),
    accountLoginPassword: new FormControl('', [Validators.required])
  });
  authparams = this.navParams.data.authparams;
  cinema = this.appSvc.currentCinema;
  @ViewChild('accountLoginNameInput', {static: false}) private accountLoginNameInput: ElementRef;

  constructor(
    private zone: NgZone,
    private appSvc: AppService,
    public authSvc: AuthService,
    private modalController: ModalController,
    private navParams: NavParams,
    private message: NzMessageService,
    private posAuthSvc: PosAuthService) {
    setTimeout(() => {
      this.accountLoginNameInput.nativeElement.focus();
    }, 800);
  }

  commit() {
    const name = this.form.get('accountLoginName').value;
    const pass = this.form.get('accountLoginPassword').value;
    if (!this.form.valid) {
      if (!name) {
        this.message.warning('请输入登录账号');
      } else if (!pass) {
        this.message.warning('请输入登录密码');
      }
      return false;
    }
    this.authparams.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    const alias = JSON.parse(this.authSvc.getCurrentUserOrgAlias());
    this.authparams.orgAlias = alias[0];
    this.authparams.accountLoginName = name;
    if (aidaShell) {
      aidaShell.encryptSensitiveInfo((status, err, data) => {
        this.authparams.accountLoginPassword = data;
        this.zone.run(() => {
          this.loginAuthInvoke();
        });
      }, pass);
    } else {
      this.authparams.accountLoginPassword = getPassword(pass);
      this.loginAuthInvoke();
    }
  }

  change(target, e) {
    this.form.get(target).setValue(e);
  }

  keyChange(target, e) {
    const keys = ['accountLoginName', 'accountLoginPassword'];
    let index = keys.indexOf(target);
    if (e === 'prev') {
      index = index - 1;
    } else {
      index = index + 1;
    }
    const key = keys[index];
    this[key].elementRef.nativeElement.click();

  }

  loginAuthInvoke() {
    this.posAuthSvc.auth(this.authparams).subscribe(res => {
      console.log(res);
      if (res.status.status === 0) {
        this.modalController.dismiss(res).then();
      } else {

      }
    });
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

}
