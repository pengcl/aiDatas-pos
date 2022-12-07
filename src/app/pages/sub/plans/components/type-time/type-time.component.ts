import {Component, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RepairDatePipe} from '../../../../../@theme/pipes/pipes.pipe';
import {SubDto} from '../../../sub.service';
import {isTrue} from '../../../../../@core/utils/extend';
import {IonContent} from '@ionic/angular';
import {CacheService} from '../../../../../@core/utils/cache.service';
import {interval as observableInterval} from 'rxjs/internal/observable/interval';

@Component({
  selector: 'app-sub-plans-time',
  templateUrl: './type-time.component.html',
  styleUrls: ['./type-time.component.scss'],
  providers: [DatePipe, RepairDatePipe]
})
export class SubPlansTimeComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) public content: any;
  subscribe = null;
  sub: SubDto;

  constructor(private cacheSvc: CacheService) {
  }

  ngOnInit() {
    this.subscribe = this.cacheSvc.getSubStatus().subscribe(res => {
      const sub = isTrue(res) ? res : {};
      if (!this.sub) {
        this.sub = sub;
      }
      if (this.sub.updateTime !== sub.updateTime) {
        this.sub = sub;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
