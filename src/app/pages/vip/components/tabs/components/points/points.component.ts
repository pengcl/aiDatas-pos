import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../../../@theme/modules/toast';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VipService } from '../../../../vip.service';
@Component({
  selector: 'app-vip-tabs-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss'],
  providers: [DatePipe, NzMessageService]
})
export class VipTabsPointsComponent implements OnInit, OnDestroy {
  start;
  end;
  subscribe;
  constructor(private datePipe: DatePipe,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private vipService: VipService,
  ) {
  }
  uidMember;
  form: FormGroup = new FormGroup({
    start: new FormControl('', []),
    end: new FormControl('', []),
  });
  page = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 6,
    pageIndex: 1 // 当前页数
  };

  ngOnInit() {
    this.subscribe = this.vipService.getMemberInfo().subscribe(res => {
      if (res) {
        console.log('积分记录tab-结转监听到会员信息变化');
        this.memberDetailChange(res);
      } else {
        this.uidMember = null;
      }
    });
  }

  memberDetailChange(memberDetail) {
    this.uidMember = memberDetail.uid;
    this.resetData();
    this.queryMemberPointsRecord();
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
  dateChange(target, e) {
    // this.resetData();
  }
  tradeQueryBtn(){
    this.page.pageIndex = 1;
    this.page.pageSize = 6;
    this.queryMemberPointsRecord();
  }
  // 查询积分交易记录
  queryMemberPointsRecord() {
    if (this.uidMember === undefined || this.uidMember === null) {
      return;
    }
    const params: any = {};
    params.uidMember = this.uidMember;
    params.recordBillStartTime = this.datePipe.transform(this.form.get('start').value, 'yyyy-MM-dd');
    params.recordBillEndTime = this.datePipe.transform(this.form.get('end').value, 'yyyy-MM-dd');
    params.page = {
      currentPage: this.page.pageIndex,
      pageSize: this.page.pageSize
    };
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipService.queryMemberPointsRecord(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        console.log('查询积分交易记录结果-->', res.data);
        if (res.data && res.data.detail) {
          const pointsTradeList = res.data.detail;
          if (pointsTradeList && pointsTradeList.length > 0) {
            pointsTradeList.forEach(item => {
              if (item.recordType === 1) {
                item.recordTypeName = '消费';
              } else if (item.recordType === 2) {
                item.recordTypeName = '充值-送';
              } else if (item.recordType === 3) {
                item.recordTypeName = '退货';
              } else if (item.recordType === 4) {
                item.recordTypeName = '充值冲销';
              } else if (item.recordType === 5) {
                item.recordTypeName = '消费-送';
              } else if (item.recordType === 6) {
                item.recordTypeName = '退货-送';
              } else if (item.recordType === 7) {
                item.recordTypeName = '积分结转-出';
              } else if (item.recordType === 8) {
                item.recordTypeName = '积分结转-入';
              } else {
                item.recordTypeName = '';
              }
            });
          }
          this.page.pageIndex = res.data.page.currentPage;
          this.page.total = res.data.page.totalSize;
          this.page.datas = pointsTradeList;
        }
      } else {
        console.log('失败');
      }
    });
  }

  changePageIndex(pageIndex) {
    this.page.pageIndex = pageIndex;
    this.queryMemberPointsRecord();
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
