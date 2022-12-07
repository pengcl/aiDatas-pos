import {Component, AfterViewInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {NavParams, ModalController} from '@ionic/angular';
import {CardService, CardsInputDto} from '../../card.service';

@Component({
  selector: 'app-card-write',
  templateUrl: './write.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './write.component.scss'],
  providers: []
})
export class CardWriteComponent implements AfterViewInit {
  data;
  levels;
  page = {
    currentPage: 1,
    pageSize: 10,
    totalSize: 0
  };
  params = {
    cardType: '1',
    batchCode: '',
    cardNoEnd: '',
    cardNoStart: '',
    uidCardLevel: null,
    cardStatus: '0', // 0:未写卡|1:已写卡
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

  read() {
    this.cardSvc.readId().subscribe(res => {
      alert(res);
    });
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
