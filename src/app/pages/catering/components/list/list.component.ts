import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {PageDto} from '../../../../@theme/modules/pagination/pagination.dto';
import {CateringDetailComponent} from '../../entryComponents/detail/detail.component';

@Component({
  selector: 'app-catering-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CateringListComponent implements OnInit {
  @Input() data;
  @Input() page: PageDto;
  @Output() pageChange: EventEmitter<any> = new EventEmitter();
  @Output() done: EventEmitter<any> = new EventEmitter();
  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() askForPrint: EventEmitter<any> = new EventEmitter();

  constructor(private modalController: ModalController) {
  }

  ngOnInit() {
  }

  setDone(item) {
    this.done.next(item);
  }

  view(item) {
    this.presentViewModal(item).then();
  }

  setFinished(item) {
    this.finished.next(item);
  }

  pageIndexChange(e) {
    this.page.currentPage = e;
    this.pageChange.next(this.page);
  }

  async presentViewModal(detail) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: CateringDetailComponent,
      componentProps: detail,
      cssClass: 'default-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
  }

  print(data) {
    this.askForPrint.next(data);
  }
}
