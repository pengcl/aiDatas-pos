import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {VoucherPrinter} from '../../../../@core/utils/voucher-printer';
import {CheckAuth} from '../../../../@core/utils/check-auth';

@Component({
  selector: 'app-reprintview',
  templateUrl: 'view.html',
  styleUrls: ['view.scss'],
  providers: [NzMessageService]
})
export class ReprintViewComponent implements OnInit {

  params = this.navParams.data.params;
  datas = [
    {name: '销售交易小票', code: 'T00206', type: 'APPEND,SALE'},
    {name: '会员支付凭证', code: 'T00205', type: 'MEMBER'},
    {name: '卖品取货凭证', code: 'T00207', type: 'APPEND,SALE'},
    {name: '退货交易小票', code: 'T00209', type: 'REJECT'},
    {name: '会员开卡凭证', code: 'T00201', type: 'memCardCost,memCardNewRecharge'},
    {name: '会员充值凭证', code: 'T00202', type: 'memCardRecharge,memCardSterilisation'},
    {name: '会员销卡凭证', code: 'T00204', type: 'memCardReject'},
    {name: '会员补卡凭证', code: 'T00210', type: 'memCardRepair'}
  ];
  saleTypes = [];
  selectSaleType = [];
  memberType = [];

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private message: NzMessageService,
              private checkAuth: CheckAuth,
              private voucherPrinter: VoucherPrinter) {
  }

  ngOnInit() {
    this.params.payLabel = this.getPayModeNameLabel();
    this.getVoucherType();
  }

  getPayModeNameLabel() {
    const list = this.params.payModeList;
    const type = this.params.billSaleType;
    const arr = [];
    // 判断是否为会员支付
    let isMemberCard = false;
    if (type === 'REJECT' || type === 'memCardSterilisation') {
      list.forEach(it => {
        if (it.payModeCode === 'MemberPoints') {
          arr.push(it.payModeName + ':' + it.refundAmount + '分');
        } else {
          arr.push(it.payModeName + ':' + it.refundAmount + '元');
        }
        if (it.payModeCode === 'MemberCard' || it.payModeCode === 'MemberPoints') {
          isMemberCard = true;
          this.params.isMemberCardUid = it.uid;
        }
      });
    } else {
      list.forEach(it => {
        if (it.payModeCode === 'MemberPoints') {
          arr.push(it.payModeName + ':' + it.billPayAmount + '分');
        } else {
          arr.push(it.payModeName + ':' + it.billPayAmount + '元');
        }
        if (it.payModeCode === 'MemberCard' || it.payModeCode === 'MemberPoints') {
          isMemberCard = true;
          this.params.isMemberCardUid = it.uid;
        }
      });
    }
    this.params.isMemberCard = isMemberCard;
    return arr.join('   ');
  }

  getVoucherType() {
    this.datas.forEach(item => {
      const arr = item.type.split(',');
      let f = false;
      if (this.params.billSaleType === 'SALE' || this.params.billSaleType === 'REJECT') {
        if (this.params.isMemberCard) {
          f = true;
        }
      }
      if (arr.indexOf(this.params.billSaleType) !== -1 || (item.type === 'MEMBER' && f)) {
        this.saleTypes.push(item);
      }
    });
  }

  askForReprint() {
    const params = {
      authFuctionCode: 'operRePrint',
      uidAuthFuction: 'rePrint',
      authFuctionName: '重打印',
      authFuctionType: '4'
    };
    this.checkAuth.auth(params, null, (type) => {
      this.reprint();
    });
  }

  reprint() {
    // todo:添加授权
    if (this.selectSaleType.length === 0 && this.memberType.length === 0) {
      this.message.warning('请选择重打印凭证');
      return;
    }
    // 凭证除了会员支付凭证外
    if (this.selectSaleType.length > 0) {
      const params = {
        typeCodeList: this.selectSaleType,
        uidBill: this.params.uid,
        uidComp: this.params.uidComp
      };
      this.invokePrint(params);
    }

    // 会员支付凭证
    if (this.memberType.length > 0) {
      const params = {
        typeCodeList: this.memberType,
        uidBill: this.params.uid,
        uidComp: this.params.uidComp
      };
      this.invokePrint(params);
    }
  }

  invokePrint(params) {
    const methodName = '/printTempletService-api/templetPrint/printTemp';
    this.voucherPrinter.print(params, methodName, (res) => {
      this.message.remove();
      if (res.status === '0') {
        this.message.success(res.msg, {nzDuration: 2000});
      } else {
        this.message.error(res.msg, {nzDuration: 2000});
      }
    });
  }

  select(d, e) {
    if (d.type === 'MEMBER') {
      if (e.checked) {
        this.memberType = [d.code];
      } else {
        this.memberType = [];
      }
    } else {
      if (e.checked) {
        this.selectSaleType.push(d.code);
      } else {
        const idx = this.selectSaleType.indexOf(d.code);
        if (idx !== -1) {
          this.selectSaleType.splice(idx, 1);
        }
      }
    }
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

}
