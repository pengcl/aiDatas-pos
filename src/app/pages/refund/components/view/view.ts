import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {RefundViewService} from './view.service';


@Component({
  selector: 'app-refundview',
  templateUrl: 'view.html',
  styleUrls: ['view.scss']
})
export class RefundViewComponent implements OnInit{

  params = this.navParams.data.params;
  viewPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private viewSvc: RefundViewService) {
  }

  ngOnInit() {
     this.params.page = {
       currentPage: this.viewPage.pageIndex,
       pageSize: this.viewPage.pageSize
     };
     this.viewPage.loading = true;
     this.viewSvc.getRefundDetail(this.params).subscribe(res => {
       this.viewPage.loading = false;
       if (res.data && res.data.detail && res.data.detail.length > 0){
         res.data.detail.forEach(item => {
           item.seatLabel = item.seatRow + '排' + item.seatCol + '号';
         });
         this.viewPage.pageIndex = res.data.page.currentPage;
         this.viewPage.total = res.data.page.totalSize;
         this.viewPage.datas = res.data.detail;
       }
     });
  }

  changePageSize(pageSize ){
    this.viewPage.pageSize = pageSize;
    this.ngOnInit();
  }

  changePageIndex(pageIndex) {
    this.viewPage.pageIndex = pageIndex;
    this.ngOnInit();
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

}
