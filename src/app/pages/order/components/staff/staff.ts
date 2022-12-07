import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {StaffViewService} from './staff.service';
import {FormControl, FormGroup} from '@angular/forms';


@Component({
  selector: 'app-staff',
  templateUrl: 'staff.html',
  styleUrls: ['staff.scss']
})
export class StaffViewComponent implements OnInit{

  params = this.navParams.data.params;
  viewPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 8,
    pageIndex: 1 // 当前页数
  };
  form: FormGroup = new FormGroup({
    staffName: new FormControl('', []),
    accountLoginName: new FormControl('', [])
  });

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private viewSvc: StaffViewService) {
  }

  ngOnInit() {
    this.searchDatas(0);
  }

  searchDatas(type) {
     if (type === 0){
       this.viewPage = {
         datas: [],
         loading: false,
         total: 0, // 总数
         pageSize: 8,
         pageIndex: 1 // 当前页数
       };
     }
     this.params.accountLoginName = this.form.get('accountLoginName').value;
     this.params.staffName = this.form.get('staffName').value;
     this.params.page = {
       currentPage: this.viewPage.pageIndex,
       pageSize: this.viewPage.pageSize
     };
     this.viewPage.loading = true;
     this.viewSvc.getAccountList(this.params).subscribe(res => {
       this.viewPage.loading = false;
       if (res.status.status === 0) {
         this.viewPage.pageIndex = res.data.page.currentPage;
         this.viewPage.total = res.data.page.totalSize;
         if (res.data.detail && res.data.detail.length > 0) {
           this.viewPage.datas = res.data.detail;
         }else{
           this.viewPage.datas = [];
         }
       }
     });
  }

  changePageSize(pageSize ){
    this.viewPage.pageSize = pageSize;
    this.searchDatas(1);
  }

  changePageIndex(pageIndex) {
    this.viewPage.pageIndex = pageIndex;
    this.searchDatas(1);
  }

  selectItem(data){
    this.modalController.dismiss(data).then();
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

}
