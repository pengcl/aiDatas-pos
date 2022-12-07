import {Component, NgZone, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {CacheService} from '../../../@core/utils/cache.service';
import {SubService} from '../sub.service';
import {interval as observableInterval} from 'rxjs/internal/observable/interval';
import {isTrue} from '../../../@core/utils/extend';

@Component({
  selector: 'app-sub-sleeping',
  templateUrl: './sleeping.page.html',
  styleUrls: ['./sleeping.page.scss']
})
export class SubSleepingPage implements OnInit, OnDestroy {
  sub;
  subscribe;
  items;
  slideOpts: any = {
    startSlide: 0,
    initialSlide: 0,
    speed: 400,
    autoplay: false,
    loop: true
  };
  first = true;

  constructor(private zone: NgZone, private router: Router, private cacheSvc: CacheService, private subSvc: SubService) {
  }

  ngOnInit() {
    this.subscribe = this.cacheSvc.getSubStatus().subscribe(res => {
      const sub = isTrue(res) ? res : {};
      if (!this.sub) {
        this.init(sub);
      }
      if (this.sub.updateTime !== sub.updateTime) {
        this.init(sub);
      }
      if (this.sub.updateTime && !this.items) {
        this.getPics();
      }
    });
  }

  getPics() {
    console.log('getPics');
    this.first = false;
    this.subSvc.customPics(this.sub.cinemaCode, this.sub.terminalCode).subscribe(res => {
      if (res.status.status === 0) {
        if (res.data.length > 0) {
          const items = [];
          res.data.forEach(item => {
            items.push(item.URL + '?time=' + new Date().getTime());
          });
          this.slideOpts.autoplay = items.length > 1 ? {
            delay: 5000
          } : false;
          this.items = items;
        } else {
          this.items = ['/assets/sleep/sleep.png'];
        }
      }
    });
  }

  init(sub) {
    this.sub = sub;
    if (this.sub.enter) {
      this.zone.run(() => {
        this.router.navigate(['/sub/' + this.sub.enter]).then();
      });
    }
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
}
