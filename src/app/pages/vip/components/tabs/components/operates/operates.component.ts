import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../../../@theme/modules/toast';
import {DialogService} from '../../../../../../@theme/modules/dialog';
import {VipService} from '../../../../vip.service';
import {CardService} from '../../../../../card/card.service';
import {VipCouponsV2Component} from '../../../../entryComponents/couponsV2/couponsV2';
import {CheckAuth} from '../../../../../../@core/utils/check-auth';

@Component({
  selector: 'app-vip-tabs-operates',
  templateUrl: './operates.component.html',
  styleUrls: ['./operates.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsOperatesComponent implements OnInit, OnDestroy {
  date = null;
  @Output() askForRefresh: EventEmitter<any> = new EventEmitter();

  constructor(private datePipe: DatePipe, private modalController: ModalController,
              private dialogSvc: DialogService,
              private message: NzMessageService,
              private cardSvc: CardService,
              private vipSvc: VipService,
              private checkAuth: CheckAuth,
              private toastSvc: ToastService) {
  }

  optTypes = [
    {label: '赠送会员票券', value: '0', disabled: false},
    {label: '赠送储值', value: '1', disabled: true},
    {label: '修改积分余额', value: '2', disabled: false},
    {label: '变更会员卡等级', value: '3', disabled: false},
    {label: '修改会员卡有效期', value: '4', disabled: false},
    {label: '撤销-赠送会员票券', value: '5', disabled: true},
    {label: '撤销-赠送储值', value: '6', disabled: true}
  ];
  member;
  form: FormGroup = new FormGroup({
    optType: new FormControl(null, [Validators.required]),
    uidIssue: new FormControl(null, [Validators.required]),
    ticketName: new FormControl(null, [Validators.required]),
    givingAmount: new FormControl(null, [Validators.required]),
    givingMoney: new FormControl(null, [Validators.required]),
    memberPoints: new FormControl(null, [Validators.required]),
    uidCardLevel: new FormControl(null, [Validators.required]),
    cardLevelName: new FormControl(null, [Validators.required]),
    oldCardLevelName: new FormControl(null, [Validators.required]),
    cardValidDate: new FormControl(null, [Validators.required])
  });
  page = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 6,
    pageIndex: 1 // 当前页数
  };
  tickets;
  levels;
  subscribe;

  ngOnInit() {
    this.form.get('uidIssue').valueChanges.subscribe(res => {
      if (res) {
        const ticketName = this.tickets.filter(item => item.uidIssue === res)[0].ticketName;
        this.form.get('ticketName').setValue(ticketName);
      }
    });
    this.form.get('uidCardLevel').valueChanges.subscribe(res => {
      if (res) {
        const cardLevelName = this.levels.filter(item => item.uid === res)[0].cardLevelName;
        this.form.get('cardLevelName').setValue(cardLevelName);
        this.form.get('oldCardLevelName').setValue(this.member.cardSeleted.cardLevelName);
      }
    });
    this.form.get('optType').valueChanges.subscribe(res => {
      if (res === '0') {
        this.setForm(['uidIssue', 'ticketName', 'givingAmount']);
      }
      if (res === '1') {
        this.setForm(['givingMoney']);
      }
      if (res === '2') {
        this.setForm(['memberPoints']);
      }
      if (res === '3') {
        this.setForm(['uidCardLevel', 'cardLevelName', 'oldCardLevelName']);
      }
      if (res === '4') {
        this.setForm(['cardValidDate']);
      }
    });
    this.subscribe = this.vipSvc.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('操作记录tab-结转监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.member = null;
      }
    });
    this.getCoupons();
    this.getLevels();
  }

  cardValidDateChange(e) {
    this.form.get('cardValidDate').setValue(this.datePipe.transform(e, 'yyyy-MM-dd'));
  }

  showCoupons(uid) {
    this.presentCouponsModal(uid).then();
  }

  setForm(keys) {
    for (const key in this.form.controls) {
      if (keys.indexOf(key) !== -1) {
        this.form.get(key).enable();
      } else {
        if (key !== 'optType') {
          this.form.get(key).disable();
        }
      }
    }
  }

  getLevels() {
    this.cardSvc.levels().subscribe(res => {
      this.levels = res.data ? res.data.filter(item => item.status === 0) : [];
    });
  }

  // 重置密码
  async presentCouponsModal(uid) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: VipCouponsV2Component,
      componentProps: {uid}
    });
    await modal.present();
    await modal.onDidDismiss(); // 获取关闭传回的值
  }

  getCoupons() {
    const params = {
      auditStatus: '3',
      billStatus: '2',
      salesMode: '2',
      ticketStatus: '2',
      uid: '1',
      validateMode: '1',
      filterDate: '1',
      page: {currentPage: 1, pageSize: 999}
    };
    this.vipSvc.coupons(params).subscribe(res => {
      console.log(res);
      this.tickets = res.data.detail;
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
    this.member = memberDetail;
    console.log(this.member);
    this.resetData();
    this.searchItems();
  }

  search() {
    this.page.pageIndex = 1;
    this.page.pageSize = 6;
    this.searchItems();
  }

  beforeSubmit() {
    if (this.form.invalid) {
      return false;
    }
    const params = {
      uidAuthFuction: 'operate',
      authFuctionCode: 'operSpecial',
      authFuctionType: '4'
    };
    this.checkAuth.auth(params, '', () => {
      this.submit();
    });
  }

  beforeCancel(item) {
    this.dialogSvc.show({content: item.optType === 1 ? '是否确定撤销本次赠送储值？' : '是否确定撤销本次赠券？', confirm: '是的', cancel: '不了'}).subscribe(res => {
      if (res.value) {
        const params = {
          uidAuthFuction: 'operate',
          authFuctionCode: 'operSpecial',
          authFuctionType: '4'
        };
        this.checkAuth.auth(params, '', () => {
          this.cancel(item);
        });
      }
    });
  }

  submit() {
    const params = this.form.value;
    params.uidMember = this.member.uid;
    params.uidMemberCard = this.member.cardSeleted.uidMemberCard;
    params.cardNo = this.member.cardSeleted.cardNo;
    params.memberPhoneNum = this.member.memberMobile;
    this.vipSvc.operate(this.form.value).subscribe(res => {
      this.form.reset();
      this.date = null;
      this.askForRefresh.emit(true);
      this.search();
    });
  }

  cancel(item) {
    console.log(item);
    this.vipSvc.cancel(item.uid).subscribe(res => {
      console.log(res.status.status !== 0);
      if (res.status.status !== 0) {
        this.message.error(res.status.msg2Client);
      } else {
        this.toastSvc.success('撤销成功');
        this.askForRefresh.emit(true);
        this.search();
      }
    });
  }

  // 查询操作记录
  searchItems() {
    const params: any = {};
    params.uidMember = this.member.uid;
    params.uidMemberCard = this.member.cardSeleted.uidMemberCard;
    params.page = {
      currentPage: this.page.pageIndex,
      pageSize: this.page.pageSize
    };
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipSvc.operates(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        console.log('operates-->', res.data);
        if (res.data && res.data.detail) {
          this.page.pageIndex = res.data.page.currentPage;
          this.page.total = res.data.page.totalSize;
          this.page.datas = res.data.detail;
        }
      } else {
        console.log('失败');
      }
    });
  }

  changePageIndex(pageIndex) {
    this.page.pageIndex = pageIndex;
    this.searchItems();
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
