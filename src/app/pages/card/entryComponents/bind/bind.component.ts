import {Component, AfterViewInit} from '@angular/core';
import {NavParams, ModalController} from '@ionic/angular';
import {CardService} from '../../card.service';

@Component({
  selector: 'app-card-bind',
  templateUrl: './bind.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './bind.component.scss'],
  providers: []
})
export class CardBindComponent implements AfterViewInit {
  data;
  levels;
  page = {
    currentPage: 1,
    pageSize: 10,
    totalSize: 0
  };
  params = {
    cardType: '2',
    batchCode: '',
    uidCardLevel: null,
    cardStatus: '0',
    page: {
      currentPage: 1,
      pageSize: 10,
      totalSize: 0
    }
  };

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private cardSvc: CardService) {
    this.getLevels();
    this.getData();
  }

  getLevels() {
    this.cardSvc.levels().subscribe(res => {
      this.levels = res.data;
    });
  }

  getData() {
    this.cardSvc.cards(this.params).subscribe(res => {
      this.params.page = res.data.page;
      this.data = res.data.detail;
    });
  }

  ngAfterViewInit() {
  }

  pageIndexChange(e) {
    this.params.page.currentPage = e;
    this.getData();
  }

  search() {
    this.params.page.currentPage = 1;
    this.getData();
  }

  confirm() {
  }

  // 取消关闭
  dismiss() {
    this.modalController.dismiss().then();
  }
}
