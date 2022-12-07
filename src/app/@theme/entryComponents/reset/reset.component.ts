import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../modules/toast';
import {AppService} from '../../../app.service';
import {AuthService} from '../../../pages/auth/auth.service';
import {VipService} from '../../../pages/vip/vip.service';
import {PasswordService} from '../../modules/password';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset.component.html',
  styleUrls: ['../../../../theme/ion-modal.scss', './reset.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class ResetPasswordComponent {
  memberUid;
  form: FormGroup = new FormGroup({
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^[0-9]+.?[0-9]*/),
      Validators.maxLength(6)
    ]) // 新密码
  });

  constructor(private navParams: NavParams,
              private message: NzMessageService,
              private modalController: ModalController,
              private appSvc: AppService,
              private authSvc: AuthService,
              private vipService: VipService,
              private toastSvc: ToastService,
              private passwordSvc: PasswordService) {
    this.memberUid = this.navParams.data.params.memberUid;
  }

  startup(target: string) {
    this.passwordSvc.show().subscribe(res => {
      console.log(res);
      if (res) {
        this.form.get(target).setValue(res);
      }
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

  // 重置会员密码
  confirm() {
    for (const i in this.form.controls) {
      if (this.form.controls.hasOwnProperty(i)) {
        this.form.controls[i].markAsDirty();
        this.form.controls[i].updateValueAndValidity();
      }
    }
    if (this.form.invalid) {
      return false;
    }
    console.log('form-->', this.form.value);
    const paramData = {
      newPassword: this.form.value.newPassword,
      uid: this.memberUid // 会员uid
    };
    console.log('重置会员密码参数', paramData);
    this.toastSvc.loading('正在处理...', 0);
    this.vipService.passwordReset(paramData).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.message.success('重置会员密码成功');
        this.modalController.dismiss(this.form.value).then();
      } else {
        console.log('失败');
        this.message.error(res.status.msg2Client);
      }
    });
  }
}
