import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {NavParams} from '@ionic/angular';
import {VipService} from '../../vip.service';
import {RmbPipe} from '../../../../@theme/pipes/pipes.pipe';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-vip-coupons',
  templateUrl: 'coupons.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', 'coupons.scss'],
  providers: [RmbPipe, NzMessageService]
})
export class VipCouponsComponent {
  now = new Date().getTime();
  page = {
    currentPage: 1,
    pageSize: 10
  };
  form: FormGroup = new FormGroup({
    auditStatus: new FormControl('3', []),
    batchNo: new FormControl('', []), // 批次
    billStatus: new FormControl('2', []),
    category: new FormControl('', []), // 分类 1:影院券 2:卖品券 3:混合券
    issueNo: new FormControl('', []), // 发行编码
    issuer: new FormControl('', []), // 发行人
    salesMode: new FormControl('2', []),
    ticketName: new FormControl('', []), // 票券名称
    ticketStatus: new FormControl('2', []),
    type: new FormControl('', []), // 类型 1:兑换券 2:优惠券 3:代金券
    uid: new FormControl('1', []),
    validateMode: new FormControl('1', []),
    filterDate: new FormControl('1', [])
  });

  type = {
    1: '兑换券',
    2: '优惠券',
    3: '代金券'
  };

  category = {
    1: '影院券',
    2: '卖品券',
    3: '混合券'
  };

  isAllDisplayDataChecked = false;
  isOperating = false;
  isIndeterminate = false;
  listOfDisplayData;
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  mapOfChecked: { [key: string]: any } = {};
  numberOfChecked = 0;
  total = 0;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private message: NzMessageService,
              private vipSvc: VipService) {
    console.log(navParams.data);
    // this.mapOfCheckedId = navParams.data.mapOfCheckedId;
    this.getData();
  }

  search() {
    this.page.currentPage = 1;
    this.getData();
  }

  getData() {
    const body = this.form.value;
    body.page = this.page;
    this.vipSvc.coupons(body).subscribe(res => {
      this.total = res.data.page.totalSize;
      this.listOfAllData = res.data.detail;
    });
  }

  currentPageDataChange($event): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData
    .filter(item => !item.disabled)
    .every(item => this.mapOfCheckedId[item.uidIssue]);
    this.isIndeterminate =
      this.listOfDisplayData.filter(item => !item.disabled).some(item => this.mapOfCheckedId[item.uidIssue]) &&
      !this.isAllDisplayDataChecked;
    this.numberOfChecked = this.listOfAllData.filter(item => {
      this.mapOfChecked[item.uidIssue] = this.mapOfCheckedId[item.uidIssue] ? item : null;
      return this.mapOfCheckedId[item.uidIssue];
    }).length;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled)
    .forEach(item => {
      this.mapOfCheckedId[item.uidIssue] = value;
      this.mapOfChecked[item.uidIssue] = item;
    });
    this.refreshStatus();
  }

  changePageIndex(index) {
    this.page.currentPage = index;
    this.getData();
    // this.queryMemberTicket();
  }

  confirm() {
    this.modalController.dismiss(this.mapOfChecked).then();
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

}
