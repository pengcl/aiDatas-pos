import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../@theme/modules/toast';
import {PasswordService} from '../../../../@theme/modules/password';
import {NavParams, ModalController} from '@ionic/angular';
import {AppService} from '../../../../app.service';
import {AuthService} from '../../../auth/auth.service';
import {VipService} from '../../vip.service';
import {getBirthday, getBirthdayFromIdCard} from '../../../../@core/utils/extend';

@Component({
  selector: 'app-vip-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './edit.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipEditComponent {
  info;
  cardList;
  form: FormGroup = new FormGroup({
    defualMemberCardUid: new FormControl('', [Validators.required]), // 默认卡
    memberMobile: new FormControl('', [Validators.required]), // 手机号
    memberEmail: new FormControl('', [Validators.required]), // 邮箱
    memberIdCard: new FormControl('', [Validators.required]), // 身份证
    memberQQ: new FormControl('', [Validators.required]), // 身份证
    memberSex: new FormControl('', [Validators.required]), // 性别
    memberAlias: new FormControl('', [Validators.required]), // 昵称
    memberWX: new FormControl('', [Validators.required]), // 微信
    memberBirth: new FormControl('', [Validators.required]),
    memberBirthDay: new FormControl('', [Validators.required]),
    memberBirthMonth: new FormControl('', [Validators.required])
  });
  months: any[] = Array(12)
  .fill(0)
  .map((v: any, i: number) => {
    let month: any = i + 1;
    month = month < 10 ? 0 + '' + month : month + '';
    return month;
  });
  days: any[] = Array(31)
  .fill(0)
  .map((v: any, i: number) => {
    let day: any = i + 1;
    day = day < 10 ? 0 + '' + day : day + '';
    return day;
  });

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private message: NzMessageService,
              private datePipe: DatePipe,
              private passwordSvc: PasswordService,
              private appSvc: AppService,
              public authSvc: AuthService,
              private vipService: VipService,
              private toastSvc: ToastService
  ) {

    this.info = this.navParams.data.info;
    this.cardList = this.navParams.data.cardList;
    const form = this.form;
    form.get('defualMemberCardUid').setValue(this.info.defualMemberCardUid);
    form.get('memberMobile').setValue(this.info.memberMobile);
    form.get('memberEmail').setValue(this.info.memberEmail);
    form.get('memberIdCard').setValue(this.info.memberIdCard);
    form.get('memberQQ').setValue(this.info.memberQQ);
    form.get('memberSex').setValue(this.info.memberSex);
    form.get('memberAlias').setValue(this.info.memberAlias);
    form.get('memberWX').setValue(this.info.memberWX);
    form.get('memberBirth').setValue(this.info.memberBirth);
    if (this.info.memberBirth) {
      const birthday = getBirthday(this.info.memberBirth);
      if (!this.info.memberBirthMonth) {
        form.get('memberBirthMonth').setValue(birthday.month);
      } else {
        form.get('memberBirthMonth').setValue(this.info.memberBirthMonth > 9
          ? this.info.memberBirthMonth + '' : 0 + '' + this.info.memberBirthMonth);
      }
      if (!this.info.memberBirthDay) {
        form.get('memberBirthDay').setValue(birthday.day);
      } else {
        form.get('memberBirthDay').setValue(this.info.memberBirthDay > 9
          ? this.info.memberBirthDay + '' : 0 + '' + this.info.memberBirthDay);
      }
    } else {
      if (this.info.memberBirthMonth) {
        form.get('memberBirthMonth').setValue(this.info.memberBirthMonth > 9
          ? this.info.memberBirthMonth + '' : 0 + '' + this.info.memberBirthMonth);
      }
      if (this.info.memberBirthDay) {
        form.get('memberBirthDay').setValue(this.info.memberBirthDay > 9
          ? this.info.memberBirthDay + '' : 0 + '' + this.info.memberBirthDay);
      }
    }
    this.form.get('memberBirthMonth').valueChanges.subscribe(res => {
      if (res && this.form.get('memberBirthDay').value) {
        const birthday = getBirthday(this.form.get('memberBirth').value);
        console.log(birthday.year);
        this.form.get('memberBirth').setValue((birthday.year ? birthday.year : this.datePipe.transform(new Date(), 'yyyy'))
          + '-' + res + '-' + this.form.get('memberBirthDay').value);
      }
    });
    this.form.get('memberBirthDay').valueChanges.subscribe(res => {
      if (res && this.form.get('memberBirthMonth').value) {
        const birthday = getBirthday(this.form.get('memberBirth').value);
        this.form.get('memberBirth').setValue((birthday.year ? birthday.year : this.datePipe.transform(new Date(), 'yyyy'))
          + '-' + this.form.get('memberBirthMonth').value + '-' + res);
      }
    });
  }

  getBirthday() {
    const birthday = getBirthday(getBirthdayFromIdCard(this.form.get('memberIdCard').value));
    if (birthday && birthday.year){
      this.form.get('memberBirth').setValue(birthday.year + '-' + birthday.month + '-' + birthday.day);
      this.form.get('memberBirthMonth').setValue(birthday.month);
      this.form.get('memberBirthDay').setValue(birthday.day);
    }else{
      this.form.get('memberBirth').setValue(null);
      this.form.get('memberBirthMonth').setValue(null);
      this.form.get('memberBirthDay').setValue(null);
    }
  }

  change(e) {
    console.log(e);

  }

  dateChange(target, e) {
    console.log(this.form.value);
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

  // 修改信息
  confirm() {
    this.passwordSvc.show().subscribe(password => {
      if (!password) {
        return false;
      }
      const formValue = this.form.value;
      const paramData = {
        uid: this.info.memberUid,
        memberMobile: formValue.memberMobile,
        memberAlias: formValue.memberAlias,
        memberBirth: formValue.memberBirth,
        memberBirthMonth: formValue.memberBirthMonth,
        memberBirthDay: formValue.memberBirthDay,
        memberSex: formValue.memberSex,
        memberIdCard: formValue.memberIdCard,
        memberEmail: formValue.memberEmail,
        memberQQ: formValue.memberQQ,
        memberWX: formValue.memberWX,
        uidMemberCard: formValue.defualMemberCardUid,
        password
      };
      if (paramData.memberBirth) {
        const birthday = getBirthday(paramData.memberBirth);
        if (!paramData.memberBirthMonth) {
          paramData.memberBirthMonth = birthday.month;
        }
        if (!paramData.memberBirthDay) {
          paramData.memberBirthDay = birthday.day;
        }
      } else {
        if (paramData.memberIdCard) {
          const birthday = getBirthday(getBirthdayFromIdCard(paramData.memberIdCard));
          paramData.memberBirth = birthday.year + '-' + birthday.month + '-' + birthday.day;
          paramData.memberBirthMonth = birthday.month;
          paramData.memberBirthDay = birthday.day;
        } else if (paramData.memberBirthMonth && paramData.memberBirthDay) {
          paramData.memberBirth = this.datePipe.transform(new Date(), 'yyyy') +
            '-' + paramData.memberBirthMonth + '-' + paramData.memberBirthDay;
        }
      }
      this.toastSvc.loading('正在处理...', 0);
      this.vipService.updateMemberInfo(paramData).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          this.message.success('修改资料成功');
          this.modalController.dismiss(this.form.value).then();
        } else {
          console.log('失败');
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }
}
