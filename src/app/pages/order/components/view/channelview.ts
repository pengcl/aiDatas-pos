import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {ChannelViewService} from './channelview.service';
import {FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-channelview',
  templateUrl: 'channelview.html',
  styleUrls: ['channelview.scss']
})
export class ChannelViewComponent implements OnInit{

  params = this.navParams.data.params;
  channelCode = this.navParams.data.params.channelCode;
  checkedAll = false;
  viewPage = {
    datas: [],
    loading: false,
    total: 0, // 总数
    pageSize: 999,
    pageIndex: 1 // 当前页数
  };
  form: FormGroup = new FormGroup({
    channelName: new FormControl('', [Validators.required])
  });

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private viewSvc: ChannelViewService) {
  }

  ngOnInit() {
     this.params.channelCode = '';
     this.params.channelName = this.form.get('channelName').value;
     this.params.page = {
       currentPage: this.viewPage.pageIndex,
       pageSize: this.viewPage.pageSize
     };
     this.viewPage.loading = true;
     this.viewSvc.queryChannelCustomList(this.params).subscribe(res => {
       this.viewPage.loading = false;
       if (res.data && res.data.length > 0){
         let totalCheck = 0;
         res.data.forEach(item => {
           if (this.channelCode.indexOf(item.channelCode) !== -1){
              item.isChecked = true;
              totalCheck = totalCheck + 1;
           }else{
             item.isChecked = false;
           }
         });
         if (totalCheck === res.data.length){
           this.checkedAll = true;
         }
         this.viewPage.total = res.data.length;
         this.viewPage.datas = res.data;
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

  selectAll(e){
    this.viewPage.datas.forEach(item => {
      item.isChecked = e.checked;
    });
    this.checkedAll = e.checked;
  }

  // 单选
  select(item1, e) {
    item1.isChecked = e.checked;
    let totalCheck = 0;
    this.viewPage.datas.forEach(item => {
      if (item.isChecked){
        totalCheck = totalCheck + 1;
      }
    });
    if (totalCheck === this.viewPage.datas.length){
      this.checkedAll = true;
    }else{
      this.checkedAll = false;
    }
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

  commit(){
    const datas = this.viewPage.datas.filter(item => {
      return item.isChecked;
    });
    this.modalController.dismiss(datas).then();
  }

}
