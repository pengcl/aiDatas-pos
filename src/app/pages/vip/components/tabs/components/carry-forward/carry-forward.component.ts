import {Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {PublicUtils} from '../../../../../../@core/utils/public-utils';
import {VoucherPrinter} from '../../../../../../@core/utils/voucher-printer';
import {PasswordService} from '../../../../../../@theme/modules/password';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {VipService} from '../../../../vip.service';

@Component({
  selector: 'app-vip-tabs-carry-forward',
  templateUrl: './carry-forward.component.html',
  styleUrls: ['./carry-forward.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsCarryForwardComponent implements OnInit, OnDestroy {
  @Output() refreshTabEvent: EventEmitter<any> = new EventEmitter();
  memberDetail;
  card;  // 选择的卡号
  cardList;
  transToCard;
  readCardData;
  transType = '0';
  subscribe;
  form: FormGroup = new FormGroup({
    transType: new FormControl('0', []),
    uidMemberCard: new FormControl('', []),
    readCardNo: new FormControl('', [])
  });

  constructor(
    private datePipe: DatePipe,
    private message: NzMessageService,
    private passwordSvc: PasswordService,
    private voucherPrinter: VoucherPrinter,
    private publicUtils: PublicUtils,
    private toastSvc: ToastService,
    private vipService: VipService
  ) {
  }

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('结转tab-监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.memberDetail = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.memberDetail = memberDetail;
    this.card = memberDetail.cardSeleted;
    this.cardList = this.getEffectCardList(memberDetail.memberReCardDTOs);
    console.log('当前卡：', this.card.cardNo);
  }

  // 获取可结转的会员卡
  getEffectCardList(cardList) {
    const newCardList = [];
    const oriCard = this.card;
    if (cardList && cardList.length > 0) {
      cardList.map((v, i) => {
        if (v.uidMemberCard !== oriCard.uidMemberCard && v.reCardStatus === 0 && v.cardLevelType === 0) {
          v.cardNoLevelName = v.cardNo + ' [' + v.cardLevelName + ']';
          newCardList.push(v);
        }
      });
    }
    return newCardList;
  }

  // 同手机选择卡号
  selectCard(uidMemberCard) {
    console.log('selectCard-uidMemberCard', uidMemberCard);
    const cardList = this.cardList;
    const transToCard = null;
    if (cardList && cardList.length > 0) {
      for (const v of cardList) {
        if (v.uidMemberCard === uidMemberCard) {
          const oriCard = this.card;  // 转出卡
          const targetCard = {
            uidMember: this.memberDetail.uid,
            uidMemberCard: v.uidMemberCard,
            cardNo: v.cardNo,
            totalCash: v.totalCash,
            remainMoneyCash: v.remainMoneyCash,
            remainMoneyCift: v.remainMoneyCift,
            cardPoint: v.cardPoint,
            newTotalCash: v.totalCash + oriCard.totalCash,
            newRemainMoneyCash: v.remainMoneyCash + oriCard.remainMoneyCash,
            newRemainMoneyCift: v.remainMoneyCift + oriCard.remainMoneyCift,
            newCardPoint: v.cardPoint + oriCard.cardPoint
          };
          this.transToCard = targetCard;
          return;
        }
      }
    }
    console.log('transToCard', transToCard);
  }

  // 读取会员卡
  readCard() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('readCardNo').setValue(res.data);
          this.queryCardNo();
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  // 根据读卡查询会员卡
  queryCardNo() {
    console.log('queryCardNo');
    // cardType 1-IC卡; 2-ID卡
    const cardType = this.publicUtils.getCardType();
    if (cardType === 0) {
      this.message.error('没有设置读卡器');
      return;
    }
    const readCardNo = this.form.get('readCardNo').value;
    if (readCardNo === null || readCardNo === '') {
      return;
    }
    this.transToCard = null;
    const params = {
      version: '2',
      bussinessType: '1',
      cardNo: readCardNo,
      cardType
    };
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipService.memberQuery(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0 && res.data) {
        console.log('接口返回会员信息-->', res.data);
        const memberData = res.data;
        const cardList = memberData.memberReCardDTOs;
        if (cardList && cardList.length > 0) {
          for (const v of cardList) {
            if (v.cardNo === readCardNo || v.cardNo === readCardNo) {
              const oriCard = this.card;  // 转出卡
              const uidMemberCard = this.form.get('uidMemberCard').value;
              if (uidMemberCard === v.uidMemberCard) {
                this.message.warning('转入转出同一会员卡，不能结转');
                return;
              }
              if (v.reCardStatus === -1 || v.reCardStatus === -2) {
                this.message.warning('转入的会员卡是注销或冻结状态，不能结转');
                return;
              }
              if (v.cardLevelType === 1) {
                this.message.warning('转入的会员卡是权益卡，不能结转');
                return;
              }
              const targetCard = {
                uidMember: memberData.uid,
                uidMemberCard: v.uidMemberCard,
                cardNo: v.cardNo,
                totalCash: v.totalCash,
                remainMoneyCash: v.remainMoneyCash,
                remainMoneyCift: v.remainMoneyCift,
                cardPoint: v.cardPoint,
                newTotalCash: v.totalCash + oriCard.totalCash,
                newRemainMoneyCash: v.remainMoneyCash + oriCard.remainMoneyCash,
                newRemainMoneyCift: v.remainMoneyCift + oriCard.remainMoneyCift,
                newCardPoint: v.cardPoint + oriCard.cardPoint
              };
              this.transToCard = targetCard;
              return;
            }
          }
        } else {
          this.message.error(res.status.msg2Client);
        }
      }
    });
  }

  // 切换手机号结转,查询绑定的会员卡
  transTypeChange(transType) {
    this.transType = transType;
    this.form.get('readCardNo').setValue(null);
    this.form.get('uidMemberCard').setValue(null);
    this.transToCard = null;
  }

  // 余额结转
  balanceTransfer() {
    const oriCard = this.card;  // 转出卡
    if (oriCard.reCardStatus === -1 || oriCard.reCardStatus === -2) {
      this.message.warning('转出的会员卡是注销或冻结状态，不能结转');
      return;
    }
    if (oriCard.cardLevelType === 1) {
      this.message.warning('转出的会员卡是权益卡，不能结转');
      return;
    }
    const transToCard = this.transToCard;   // 转入的会员卡，即是选择的会员卡
    if (transToCard === undefined || transToCard === null) {
      console.log('请读卡或选择会员卡');
      this.message.warning('请选择转入的会员卡，或读取会员卡');
      return;
    }
    // 需输入会员密码
    this.passwordSvc.show().subscribe(passWord => {
      if (!passWord) {
        return false;
      }
      const params = {
        memberPassword: passWord,
        fromUid: this.memberDetail.uid,
        cardnoRollOut: this.card.cardNo,  // 转出的会员卡，即是初始选择进来的卡
        uidCardRollOut: this.card.uidMemberCard,
        toUid: transToCard.uidMember,
        cardnoShiftTo: transToCard.cardNo,  // 转入的会员卡，即是选择的会员卡
        uidCardShiftTo: transToCard.uidMemberCard
      };
      console.log('结转参数', params);
      this.toastSvc.loading('正在处理，请稍后...', 0);
      this.vipService.balanceTransfer(params).subscribe(res => {
        this.toastSvc.hide();
        if (res.status.status === 0) {
          this.message.success('结转成功');
          const notifier: any = {};
          notifier.method = 'refreshMemberInfo';
          notifier.toTabIndex = 12;
          this.refreshTabEvent.next(notifier);
        } else {
          this.message.error(res.status.msg2Client);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
