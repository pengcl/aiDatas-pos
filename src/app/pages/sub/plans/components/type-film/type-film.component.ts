import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import {DatePipe} from '@angular/common';
import {SubDto} from '../../../sub.service';
import {IonContent} from '@ionic/angular';
import {CacheService} from '../../../../../@core/utils/cache.service';
import {interval as observableInterval} from 'rxjs/internal/observable/interval';
import {isTrue} from '../../../../../@core/utils/extend';


@Component({
  selector: 'app-sub-plans-film',
  templateUrl: './type-film.component.html',
  styleUrls: ['./type-film.component.scss'],
  providers: [DatePipe]
})
export class SubPlansFilmComponent implements OnInit, OnDestroy {

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

  get type() {
    return this.sub && this.sub.components.film.film ? 'items' : 'group';
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

}
