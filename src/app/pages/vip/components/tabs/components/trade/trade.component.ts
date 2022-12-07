import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ToastService } from '../../../../../../@theme/modules/toast';
import { TradeDetailComponent } from '../../../../../../@theme/entryComponents/tradeDetail/tradeDetail.component';
import { VipService } from '../../../../vip.service';
interface DataItem {
  name: string;
  age: number;
  street: string;
  building: string;
  number: number;
  companyAddress: string;
  companyName: string;
  gender: string;
}

@Component({
  selector: 'app-vip-tabs-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsTradeComponent implements OnInit, OnDestroy {
  constructor(private datePipe: DatePipe, private modalController: ModalController,
              private message: NzMessageService,
              private vipService: VipService,
              private toastSvc: ToastService,
  ) {
  }
  uidMember;
  cardList;
  uidMemberCard;
  recordType;
  channelCode;
  form: FormGroup = new FormGroup({
    start: new FormControl('', []),
    end: new FormControl('', []),
    uidMemberCard: new FormControl('ALL', []),
    recordType: new FormControl(0, []),
    channelCode: new FormControl('ALL', []),

  });
  page = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 6,
    pageIndex: 1 // 当前页数
  };
  subscribe;

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('交易记录tab-结转监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.uidMember = null;
      }
    });
  }

  resetData() {
    this.page = {
      datas: [],
      loading: false,
      total: 0, // 总数
      pageSize: 6,
      pageIndex: 1 // 当前页数
    };
  }
  memberDetailChange(memberDetail) {
    this.uidMember = memberDetail.uid;
    const cardList = [{
      uidMemberCard: 'ALL',
      cardNo: '全部'
    }];
    this.cardList = cardList.concat(memberDetail.memberReCardDTOs);
    this.resetData();
    this.queryMemberTradeRecord();
  }

  // 显示打印提示界面
  async presentDetailModal(rowData) {
    const info = {
      uidComp: rowData.uidComp,
      uidBill: rowData.uidPosBill,
      billCodeThird: rowData.billCode,
      recordType: rowData.recordType
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TradeDetailComponent,
      componentProps: { info },
      cssClass: 'full-modal'
    });
    console.log('订单-->', info);
    await modal.present();
    const { data } = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }
  // 选择日期
  dateChange(target, e) {
    // console.log(target, e);
  }

  // 选择卡
  changeCard(e) {
    this.uidMemberCard = e;
    this.resetData();
    this.queryMemberTradeRecord();
  }
 // 选择交易类型
  changeRecordType(e) {
    this.recordType = e;
    this.resetData();
    this.queryMemberTradeRecord();
  }
 // 选择渠道
  changeChannel(e) {
    this.channelCode = e;
    this.resetData();
    this.queryMemberTradeRecord();
  }

  tradeQueryBtn(){
    this.page.pageIndex = 1;
    this.page.pageSize = 6;
    this.queryMemberTradeRecord();
  }
  // 查询交易记录
  queryMemberTradeRecord() {
    if (this.uidMember === undefined || this.uidMember === null) {
      return;
    }
    const params: any = {};
    params.uidMember = this.uidMember;
    params.uidMemberCard = (this.uidMemberCard === 'ALL' ? null : this.uidMemberCard);
    params.recordType = (this.recordType === 0 ? null : this.recordType);
    params.channelCode = (this.channelCode === 'ALL' ? null : this.channelCode);
    params.recordBillStartTime = this.datePipe.transform(this.form.get('start').value, 'yyyy-MM-dd');
    params.recordBillEndTime = this.datePipe.transform(this.form.get('end').value, 'yyyy-MM-dd');
    params.page = {
      currentPage: this.page.pageIndex,
      pageSize: this.page.pageSize
    };
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipService.queryMemberTradeRecord(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        console.log('queryMemberTradeRecord-->', res.data);
        if (res.data && res.data.detail) {
          const tradeList = res.data.detail;
          if (tradeList && tradeList.length > 0) {
            tradeList.forEach(item => {
              if (item.recordType === 1) {
                item.recordTypeName = '消费';
              } else if (item.recordType === 2) {
                item.recordTypeName = '充值';
              } else if (item.recordType === 3) {
                item.recordTypeName = '退货';
              } else if (item.recordType === 4) {
                item.recordTypeName = '充值冲销';
              } else if (item.recordType === 5) {
                item.recordTypeName = '余额结转';
              } else if (item.recordType === 6) {
                item.recordTypeName = '升级换卡';
              } else if (item.recordType === 7) {
                item.recordTypeName = '补卡';
              } else {
                item.recordTypeName = '';
              }
            });
          }
          this.page.pageIndex = res.data.page.currentPage;
          this.page.total = res.data.page.totalSize;
          this.page.datas = tradeList;
        }
      } else {
        console.log('失败');
      }
    });
  }

  changePageIndex(pageIndex) {
    this.page.pageIndex = pageIndex;
    this.queryMemberTradeRecord();
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
