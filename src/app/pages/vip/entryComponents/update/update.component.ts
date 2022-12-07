import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../@theme/modules/toast';
import {AppService} from '../../../../app.service';
import {AuthService} from '../../../auth/auth.service';
import {VipService} from '../../vip.service';
import {PasswordService} from '../../../../@theme/modules/password';

@Component({
  selector: 'app-vip-update',
  templateUrl: './update.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './update.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipUpdateComponent {
  memberUid;
  form: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^[0-9]+.?[0-9]*/),
      Validators.maxLength(6)
    ]), // 默认卡
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^[0-9]+.?[0-9]*/),
      Validators.maxLength(6)
    ]), // 默认卡
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^[0-9]+.?[0-9]*/),
      Validators.maxLength(6)
    ])
  });

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private message: NzMessageService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private vipService: VipService,
              private toastSvc: ToastService,
              private passwordSvc: PasswordService
  ) {
    this.memberUid = this.navParams.data.params.memberUid;
  }

  startup(target) {
    this.passwordSvc.show().subscribe(res => {
      if (res) {
        this.form.get(target).setValue(res);
      }
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

  // 修改密码
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
    if (this.form.get('newPassword').value !== this.form.get('confirmPassword').value) {
      this.message.error('两次密码输入不一致');
      return false;
    }
    const formValue = this.form.value;
    const paramData = {
      uid: this.memberUid,  // 会员uid
      oldPassword: formValue.oldPassword,
      newPassword: formValue.newPassword
    };
    console.log('修改密码参数', paramData);
    this.toastSvc.loading('正在处理...', 0);
    this.vipService.passwordChange(paramData).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.message.success('修改密码成功');
        this.modalController.dismiss(this.form.value).then();
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }
}
