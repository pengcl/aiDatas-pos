import {Component, EventEmitter, Output, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CateringService} from '../../catering.service';
import {getPage} from '../../../../@theme/modules/pagination/pagination.component';

@Component({
  selector: 'app-catering-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CateringCardComponent implements OnInit, OnChanges {
  @Input() data;
  @Output() done: EventEmitter<any> = new EventEmitter();
  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() askForPrint: EventEmitter<any> = new EventEmitter();
  page = {
    currentPage: 1,
    pageSize: 10
  };
  detail;
  waitItems;
  waitItem;
  doneItems;

  constructor(private cateringSvc: CateringService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data.currentValue) {
      this.getData();
    }
  }

  getData() {
    const waitItems = [];
    const doneItems = [];
    this.data.forEach(item => {
      if (item.takeStatus === 1) {
        waitItems.push(item);
      }
      if (item.takeStatus === 2) {
        doneItems.push(item);
      }
    });
    this.waitItems = waitItems;
    this.doneItems = doneItems;
    if (this.waitItems.length > 0) {
      this.getItem(this.waitItems[0]);
    } else {
      this.detail = null;
    }
  }

  getItem(item) {
    this.waitItem = item;
    this.cateringSvc.item(this.waitItem.uidBill).subscribe(res => {
      const data: any = {};
      const items: { name: string; uid: string; count: number; }[] = [];
      res.data.posBillResDetailDTOList.forEach(i => {
        if (i.isCombo) {
          if (data[i.uidRes]) {
            data[i.uidRes].count = data[i.uidRes].count + 1;
          } else {
            data[i.uidRes] = {
              name: i.resName,
              uid: i.uidRes,
              count: 1
            };
          }
        } else {
          i.contailDTOList.forEach(sub => {
            if (data[sub.uidRes]) {
              data[sub.uidRes].count = data[sub.uidRes].count + 1;
            } else {
              data[sub.uidRes] = {
                name: sub.resName,
                uid: sub.uidRes,
                count: 1
              };
            }
          });
        }
      });
      for (const key in data) {
        if (data[key]) {
          items.push(data[key]);
        }
      }
      this.page = getPage(items);
      res.data.items = items;
      this.detail = res.data;
    });
  }

  setDone(item) {
    this.done.next(item);
  }

  setFinished(item) {
    this.finished.next(item);
  }

  pageChange(e) {
    this.page.currentPage = e;
    this.getData();
  }

  print(data) {
    if (data) {
      this.askForPrint.next(data);
    }
  }
}
