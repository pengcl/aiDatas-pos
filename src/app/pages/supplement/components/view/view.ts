import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {ViewService} from './view.service';


@Component({
  selector: 'app-view',
  templateUrl: 'view.html',
  styleUrls: ['view.scss']
})
export class ViewComponent implements OnInit{

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
              private viewSvc: ViewService) {
  }

  ngOnInit() {
     this.viewPage.loading = true;
     this.viewSvc.getAppendApplyDetailList(this.params).subscribe(res => {
       this.viewPage.loading = false;
       this.viewPage.datas = res.data;
     });
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

}
