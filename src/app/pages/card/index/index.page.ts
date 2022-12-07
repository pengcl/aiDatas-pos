import {Component, NgZone, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {ToastService} from '../../../@theme/modules/toast';
import {DialogService} from '../../../@theme/modules/dialog';
import {NzMessageService} from 'ng-zorro-antd/message';
import {SnackbarService} from '../../../@core/utils/snackbar.service';
import {ShoppingCartService} from '../../shopping-cart/shopping-cart.service';
import {VipService} from '../../vip/vip.service';
import {PasswordService} from '../../../@theme/modules/password';
import {CardService} from '../card.service';
import {PublicUtils} from '../../../@core/utils/public-utils';
import {MemberService} from '../../../@theme/modules/member/member.service';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';

import {getBirthdayFromIdCard, getBirthday} from '../../../@core/utils/extend';
import {RmbPipe} from '../../../@theme/pipes/pipes.pipe';
import {CardWriteComponent} from '../entryComponents/write/write.component';
import {CardBindComponent} from '../entryComponents/bind/bind.component';
import {ActivityDetailComponent} from '../../../@theme/entryComponents/activityDetail/activityDetail.component';

@Component({
  selector: 'app-card-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService, RmbPipe]
})
export class CardIndexPage {
  info;
  rechargeOptions = [];
  isMore = false;
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
  memberPassword;
  form: FormGroup = new FormGroup({
    cardNo: new FormControl('', [Validators.required]),
    memberMobile: new FormControl('', [Validators.required, Validators.pattern(/^1[3456789]\d{9}$/)]),
    actualCash: new FormControl('', [Validators.required]),
    cardLevelType: new FormControl('', []),
    expense: new FormControl('', []),
    isDisable: new FormControl(false, []),
    memberAlias: new FormControl('', []),
    memberBirth: new FormControl(null, []),
    memberBirthDay: new FormControl(null, []),
    memberBirthMonth: new FormControl(null, []),
    memberEmail: new FormControl('', [Validators.email]),
    memberId: new FormControl('', []),
    memberIdCard: new FormControl('', []),
    memberPassword: new FormControl('', []),
    memberQQ: new FormControl('', []),
    memberSex: new FormControl(0, [Validators.required]),
    memberWX: new FormControl('', []),
    remainMoneyCash: new FormControl('', [Validators.required]),
    uid: new FormControl('', []),
    uidCampaign: new FormControl('', []),
    uidCardLevel: new FormControl('', [Validators.required]),
    uidMemberCard: new FormControl('', [Validators.required])
  });
  downLimited = 0;
  activities;
  activity;
  // 静态充值项目
  staticRechargeOption = [0, 50, 100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000];
  @ViewChild('memberMobile', {static: false}) private memberMobile;
  @ViewChild('cardNo', {static: false}) private cardNo;
  overlayRef;
  loading = false;

  passwordIsCalled = false;
  subscribe: any = {};

  constructor(private zone: NgZone,
              private router: Router,
              private modalController: ModalController,
              private publicUtils: PublicUtils,
              private snackbarSvc: SnackbarService,
              private toastSvc: ToastService,
              private dialogSvc: DialogService,
              private message: NzMessageService,
              private passwordSvc: PasswordService,
              private shoppingCartSvc: ShoppingCartService,
              private vipSvc: VipService,
              private cardSvc: CardService,
              private memberSvc: MemberService,
              private voucherPrinter: VoucherPrinter,
              private rmbPipe: RmbPipe) {
  }

  ionViewDidEnter() {
    // this.presentWriteModal().then();
    this.reset();
    this.subscribe.remainMoneyCash = this.form.get('remainMoneyCash').valueChanges.subscribe(res => {
      this.form.get('actualCash')
      .setValue(this.rmbPipe.transform(this.form.get('remainMoneyCash').value));
    });
    this.subscribe.expense = this.form.get('expense').valueChanges.subscribe(res => {
      this.form.get('actualCash')
      .setValue(this.rmbPipe.transform(this.form.get('expense').value));
    });
    this.subscribe.memberMobile = this.form.get('memberMobile').valueChanges.subscribe(() => {
      if (this.form.get('memberMobile').valid) {
        this.overlayRef.dispose();
        this.cardSvc.phoneCheck(this.form.get('memberMobile').value).subscribe(res => {
          if (res.data.uid) {
            this.dialogSvc.show({content: '该手机号码已注册，请输入会员密码验证！', cancel: '取消', confirm: '确定'}).subscribe(result => {
              if (result.value) {
                this.askPassword(res.data.uid);
              } else {
                this.reset();
              }
            });
          }
        });
      }
    });
  }

  // 显示详情界面
  async presentModal(e, activity) {
    // e.stopPropagation();
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ActivityDetailComponent,
      componentProps: {activity},
      cssClass: ''
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }

  askPassword(uid) {
    this.passwordIsCalled = true;
    this.passwordSvc.show('', true, uid).subscribe(res => {
      this.passwordIsCalled = false;
      if (!res) {
        this.reset();
        return false;
      }
      this.memberPassword = res.password;
      for (const key in this.form.value) {
        if (key !== 'memberMobile' && (res.member[key] || res.member[key] === 0)) {
          if (key === 'memberBirthDay' || key === 'memberBirthMonth') {
            if (res.member[key] < 10) {
              this.form.get(key).setValue('0' + res.member[key]);
            } else {
              this.form.get(key).setValue('' + res.member[key]);
            }
          } else {
            this.form.get(key).setValue(res.member[key]);
          }
        }
      }
      this.form.get('memberPassword').setValue(res.password);
      this.form.get('memberId').setValue(res.memberId);
      this.form.get('uid').setValue(res.uid);
    });
  }

  getOverlay(overlayRef) {
    this.overlayRef = overlayRef;
  }

  // 会员卡
  readCard() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('cardNo').setValue(res.data);
          this.blur('cardNo');
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  async presentWriteModal() {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: CardWriteComponent,
      cssClass: 'full-modal',
      componentProps: {}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }

  setActivity(activity) {
    this.activity = activity;
    this.form.get('remainMoneyCash').setValue(activity.originalAmount);
    if (this.activity.uid.indexOf('no') === -1) {
      this.form.get('uidCampaign').setValue(this.activity.uid);
    } else {
      this.form.get('uidCampaign').setValue('');
    }
  }

  blur(target) {
    if (target === 'cardNo') {
      if (!this.form.get(target).value) {
        return false;
      }
      this.cardSvc.info(this.form.get(target).value).subscribe(res => {
        console.log('res.data-->', res.data);
        this.form.get('uidCampaign').setValue('');
        this.form.get('remainMoneyCash').setValue('');
        if (res.data) {
          // 会员卡等级类型，0为储值卡，1为权益卡
          /*this.form.get('remainMoneyCash').setValue(res.data.rechargeLower);
          this.form.get('remainMoneyCash').setValidators([Validators.min(res.data.rechargeLower)]);
          console.log(this.form.value);*/
          this.info = res.data;
          this.form.get('uidMemberCard').setValue(this.info.uid);
          this.form.get('uidCardLevel').setValue(this.info.uidCardLevel);
          this.form.get('cardLevelType').setValue(this.info.cardLevelType);
          this.form.get('expense').setValue(this.info.expense);
          if (res.data.cardLevelType === 0) {//// 储值卡
            let downLimited = 0; // 最低充值金额
            let upLimited = 0; // 最高充值金额
            if (res.data.monetaryLimit && res.data.monetaryLimit > 0) { // 设置了首次充值金额
              downLimited = res.data.monetaryLimit;
              upLimited = 0;
            } else { // 没有设置首次充值金额
              if (res.data.rechargeLower && res.data.rechargeLower > 0) {
                downLimited = res.data.rechargeLower;
              }
              if (res.data.rechargeUpper && res.data.rechargeUpper > 0) {
                upLimited = res.data.rechargeUpper;
              }
            }
            res.data.monetaryLimit = downLimited;
            res.data.monetaryLimitName = downLimited;
            res.data.rechargeLower = downLimited;
            // 计算充值金额限制名
            let rechargeLimitText = '';
            console.log('计算充值限制，downLimited:', downLimited, 'upLimited:', upLimited);
            if (downLimited === 0 && upLimited === 0) {
              rechargeLimitText = '单次充值限额范围：不限';
            } else if (downLimited > 0 && upLimited === 0) {
              rechargeLimitText = '最低充值金额：' + downLimited;
            } else if (downLimited > 0 && upLimited > 0) {
              rechargeLimitText = '单次充值限额范围 ¥ ' + downLimited + '-' + upLimited;
            } else if (downLimited === 0 && upLimited > 0) {
              rechargeLimitText = '最高充值金额：' + upLimited;
            }
            res.data.rechargeLimitText = rechargeLimitText;
            this.info = res.data;

            this.downLimited = downLimited;
            this.form.get('remainMoneyCash').setValue(res.data.rechargeLower);
            this.form.get('remainMoneyCash').setValidators([Validators.min(res.data.rechargeLower)]);
            if (res.data.rechargeUpper) {
              this.form.get('remainMoneyCash').setValidators([Validators.max(res.data.rechargeUpper)]);
            }
            // 计算可参与的活动
            const rechargeActivities = [];
            const oriCampaignList = res.data.campaignShowDTOList;
            if (oriCampaignList && oriCampaignList.length > 0) {
              oriCampaignList.map((v, i) => {
                if (downLimited === 0 && upLimited === 0) {
                  // 不限制
                  rechargeActivities.push(v);
                } else if (downLimited > 0 && upLimited === 0) {
                  // 充值下限制
                  if (v.originalAmount >= downLimited) {
                    rechargeActivities.push(v);
                  }
                } else if (downLimited > 0 && upLimited > 0) {
                  // 充值上，下限制
                  if (v.originalAmount >= downLimited && v.originalAmount <= upLimited) {
                    rechargeActivities.push(v);
                  }
                } else if (downLimited === 0 && upLimited > 0) {
                  // 充值上限制
                  if (v.originalAmount <= upLimited) {
                    rechargeActivities.push(v);
                  }
                }
              });
            }
            const newCampList = [];
            for (const camp of rechargeActivities) {
              newCampList.push(camp.originalAmount);
            }
            const staticRechargeOption = this.staticRechargeOption;
            const staticList = [];
            if (staticRechargeOption && staticRechargeOption.length > 0) {
              for (const amount of staticRechargeOption) {
                if (newCampList && newCampList.length > 0) {
                  if (newCampList.indexOf(amount) > -1) {
                    // console.log('过滤相同的amount', amount);
                    continue;
                  }
                }
                const v: any = {};
                v.uid = 'no_' + amount;
                v.originalAmount = amount;
                v.isChecked = false;
                if (downLimited === 0 && upLimited === 0) {
                  // 不限制
                  staticList.push(v);
                } else if (downLimited > 0 && upLimited === 0) {
                  // 不限制
                  if (amount >= downLimited) {
                    staticList.push(v);
                  }
                } else if (downLimited > 0 && upLimited > 0) {
                  // 不限制
                  if (amount >= downLimited && amount <= upLimited) {
                    staticList.push(v);
                  }
                } else if (downLimited === 0 && upLimited > 0) {
                  if (amount <= upLimited) {
                    staticList.push(v);
                  }
                }
              }
            }
            let rechargeOption: any = [];
            rechargeOption = rechargeActivities.concat(staticList);
            if (rechargeOption && rechargeOption.length > 0) {
              rechargeOption.sort((a, b) => {
                if (a.originalAmount > b.originalAmount) {
                  return 1; // 升序
                } else if (a.originalAmount < b.originalAmount) {
                  return -1;
                }
              });
              rechargeOption.map((v, i) => {
                if (i === 0) {
                  v.isChecked = true;
                }
              });
            }
            this.activities = rechargeOption; // 合并后的充值选项
            if (this.activities && this.activities.length > 0) {
              this.setActivity(this.activities[0]); // 选中第一个
            }
          } else {
            console.log('validators');
            this.form.get('remainMoneyCash').clearValidators();
            this.form.get('remainMoneyCash').updateValueAndValidity();
          }
        } else {
          this.message.error(res.status.msg2Client);
          this.reset();
        }
      });
    }
    if (target === 'memberIdCard') {
      const birthday = getBirthday(getBirthdayFromIdCard(this.form.get('memberIdCard').value));
      if (birthday && birthday.year) {
        this.form.get('memberBirth').setValue(birthday.year + '/' + birthday.month + '/' + birthday.day);
        this.form.get('memberBirthMonth').setValue(birthday.month);
        this.form.get('memberBirthDay').setValue(birthday.day);
      } else {
        this.form.get('memberBirth').setValue(null);
        this.form.get('memberBirthMonth').setValue(null);
        this.form.get('memberBirthDay').setValue(null);
      }

    }
  }

  change(target, e) {
    this.form.get(target).setValue(e);
  }

  custom() {
    if (this.activity) {
      this.activity = null;
      this.form.get('uidCampaign').setValue(null);
      this.form.get('remainMoneyCash').setValue(null);
    } else {
      this.blur('cardNo');
    }
  }

  setRemainMoneyCash(item) {
    this.activity = null;
    this.form.get('uidCampaign').setValue(null);
    this.form.get('remainMoneyCash').setValue(item.amount);
  }

  more() {
    this.isMore = !this.isMore;
  }

  create() {
    this.toastSvc.loading('开卡中...', 0);
    this.cardSvc.create(this.form.value).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.toastSvc.success('开卡成功!', 1000);
        if (res.data.uidPosBill) {
          this.printMemberBussinessTicket(res.data);
        } else {
          this.zone.run(() => {
            this.router.navigate(['/checkout/index'], {
              queryParams: {
                uidShopCart: res.data.uid,
                businessType: 'MEMBER'
              }
            }).then();
          });
        }
        this.reset();
      }
    });
  }

  printMemberBussinessTicket(billRes) {
    console.log('打印会员业务小票');
    const tasks = [];
    const paramData: any = {};
    paramData.uidBill = billRes.uidPosBill;
    paramData.uidComp = billRes.uidComp;
    paramData.dicCode = 'printAcCert';
    paramData.typeCode = 'T00201'; // 开卡凭证
    tasks.push(paramData);
    if (tasks.length > 0) {
      this.voucherPrinter.printTask(tasks, (printResult) => {
        // console.log('打印结果:', printResult);
        if (printResult.status === '0') {
          // 通知后台已经打印过影票
        } else if (printResult.status === '-1') {
          console.log('后台设置不需打印');
        } else {
          const msg = '打印失败：' + printResult.msg;
          console.log(msg);
        }
      });
    }
  }

  confirm() {
    if (this.form.invalid) {
      return false;
    }
    if (!this.memberPassword) {
      this.passwordSvc.show().subscribe(res => {
        if (!res) {
          return false;
        }
        this.memberPassword = res;
        this.passwordSvc.show('请再次输入六位密码').subscribe(password => {
          if (!password) {
            this.memberPassword = null;
            this.form.get('memberPassword').setValue('');
            return false;
          }
          if (res !== password) {
            this.snackbarSvc.show('您两次输入的密码不一至，请重新输入！');
            this.memberPassword = null;
            this.form.get('memberPassword').setValue('');
          } else {
            this.form.get('memberPassword').setValue(password);
            this.create();
          }
        });
      });
    } else {
      this.create();
    }
  }

  reset() {
    this.info = '';
    this.rechargeOptions = null;
    this.form.reset();
    this.form.get('memberSex').setValue(0);
    this.activity = null;
    this.memberPassword = '';
  }

  ionViewDidLeave() {
    this.memberPassword = '';
    for (const key in this.subscribe) {
      if (this.subscribe[key]) {
        this.subscribe[key].unsubscribe();
      }
    }
  }
}
