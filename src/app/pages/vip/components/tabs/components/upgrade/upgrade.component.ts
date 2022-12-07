import {Component, NgZone, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {PasswordService} from '../../../../../../@theme/modules/password';
import {PublicUtils} from '../../../../../../@core/utils/public-utils';
import {VoucherPrinter} from '../../../../../../@core/utils/voucher-printer';
import {DialogService} from '../../../../../../@theme/modules/dialog';
import {VipService} from '../../../../vip.service';
import {MemberService} from '../../../../../../@theme/modules/member/member.service';
import {ShoppingCartService} from '../../../../../shopping-cart/shopping-cart.service';
import {ActivityDetailComponent} from '../../../../../../@theme/entryComponents/activityDetail/activityDetail.component';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-vip-tabs-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsUpgradeComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  @Output() askForUpdateMember: EventEmitter<string> = new EventEmitter();
  memberDetail;
  card;  // 选择的卡号
  newCard; // 新卡
  activities;
  activity;
  isMore = false;
  subscribe;
  form: FormGroup = new FormGroup({
    readCardNo: new FormControl('', [Validators.required])
  });

  constructor(private zone: NgZone,
              private datePipe: DatePipe,
              private message: NzMessageService,
              private modalController: ModalController,
              private router: Router,
              private publicUtils: PublicUtils,
              private passwordSvc: PasswordService,
              private toastSvc: ToastService,
              private voucherPrinter: VoucherPrinter,
              private vipService: VipService,
              private dialogSvc: DialogService,
              private memberSvc: MemberService,
              private shoppingCartSvc: ShoppingCartService) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      this.resetData();
      if (res) {
        console.log('升级卡tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    this.card = memberDetail.cardSeleted;
    console.log('当前卡：', this.card.cardNo);
  }

  // 初始数据
  resetData() {
    this.newCard = null;
    this.activity = null;
    this.activities = [];
  }

  // 会员卡
  readCard() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('readCardNo').setValue(res.data);
          this.readCardByCardNo();
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  readCardByCardNo() {
    console.log('获取新卡号信息');
    const form = this.form;
    if (form.invalid) {
      return false;
    }
    const cardType = this.publicUtils.getCardType();
    if (cardType === 0) {
      this.message.error('没有设置读卡器');
      return;
    }
    this.resetData();
    const params = {
      cardNo: form.value.readCardNo,
      bussinessType: '2', // 获取补卡，升级卡活动
      cardType
    };
    this.vipService.queryCardByReadCardNo(params).subscribe(res => {
      if (res.status.status === 0 && res.data) {
        console.log('接口返回会员信息-->', res.data);
        const newCard = res.data;
        if (newCard.uidCardLevel === this.card.uidCardLevel) {
          this.message.warning('你所输入的会员卡等级与所要升级的会员卡等级一致，请换张卡重试！');
          return;
        }
        this.newCard = newCard;
        const rechargeAmount = newCard.rechargeAmount;
        const oriCampaignList = res.data.campaignShowDTOList;
        // 计算可参与的活动
        const rechargeActivities = [];
        if (oriCampaignList && oriCampaignList.length > 0) {
          oriCampaignList.map((v, i) => {
            if (rechargeAmount === v.originalAmount) {
              rechargeActivities.push(v);
            }
          });
          if (rechargeActivities.length > 0) {
            this.activity = rechargeActivities[0];
          }
        }
        this.activities = rechargeActivities;
      } else {
        this.message.error(res.status.msg2Client);
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

  selectActivity(item) {
    this.activity = item;
  }

  more() {
    this.isMore = !this.isMore;
  }

  noSelectAct() {
    this.activity = null;
  }

  // 会员卡升级卡
  cardUpgrade() {
    if (this.newCard === null || this.newCard === undefined) {
      this.message.warning('请先读取新会员卡');
      return;
    }
    if (this.card.uidCardLevel === this.newCard.uidCardLevel) {
      this.dialogSvc.show({content: '你所输入的会员卡等级与所要升级的会员卡等级一致，请换张卡重试！', confirm: '我知道了', cancel: ''}).subscribe();
      return false;
    }
    if (this.card.cardLevelType !== this.newCard.cardLevelType) {
      this.dialogSvc.show({content: '你所输入的会员卡类型与所要升级的会员卡类型不一致，请换张卡重试！', confirm: '我知道了', cancel: ''}).subscribe();
      return false;
    }
    console.log(this.card);
    console.log('升级卡', this.newCard);
    this.passwordSvc.show().subscribe(password => {
      if (!password) {
        return false;
      }
      const params: any = {
        uidMember: this.memberDetail.uid,
        memberPassword: password,
        oldUidCard: this.card.uidMemberCard,
        uidCardLevel: this.card.uidCardLevel,
        newUidCard: this.newCard.uid,
        newUidCardLevel: this.newCard.uidCardLevel,
        changeCardFees: this.newCard.changeCardFees,
        rechargeAmount: this.newCard.rechargeAmount
      };
      if (this.activity) {
        params.uidCampaign = this.activity.uid;
      }
      console.log('升级卡参数', params);
      this.toastSvc.loading('正在处理...', 0);
      this.vipService.upgradeChangeCard(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0 && res.data) {
          if (res.data.uidPosBill) {
            // 补卡金额等于0时升级卡成功,然后触发会员查询
            // this.memberSvc.setMember(member, card).subscribe();
            this.askForUpdateMember.next(this.newCard.cardNo);
            this.form.get('readCardNo').setValue('');
            this.printCertificate(res.data);
            this.message.success('升级卡成功');
            const notifier: any = {};
            notifier.method = 'refreshMemberInfo';
            this.resetData();
            this.refreshTabEvent.next(notifier);
          } else {
            console.log('需跳转到结算');
            const uidShopCart = res.data.uid;
            this.zone.run(() => {
              this.router.navigate(['/checkout/index'], {queryParams: {uidShopCart, businessType: 'MEMBER'}}).then();
            });
          }
        } else {
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  // 打印升级卡
  printCertificate(result) {
    const params = {
      dicCode: 'printPcCert', // 升级卡编码
      typeCode: 'T00210', // 升级卡凭证
      uidBill: result.uidPosBill,
      uidComp: result.uidComp
    };
    console.log('打印升级卡凭证参数', params);
    const methodName = '/printTempletService-api/templetPrint/print';
    this.voucherPrinter.print(params, methodName, (res) => {
      if (res.status === '0') {
        console.log('打印成功');
      } else {
        console.log('打印失败', res.msg);
      }
    });
  }

  cancel() {
    console.log('取消');
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
