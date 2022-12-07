import {Component, OnDestroy, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {interval as observableInterval} from 'rxjs/internal/observable/interval';
import {CacheService} from '../../@core/utils/cache.service';
import {isTrue} from '../../@core/utils/extend';

@Component({
  selector: 'layout-sub',
  templateUrl: './sub.component.html',
  styleUrls: ['./sub.component.scss']
})
export class LayoutSubComponent implements OnDestroy {
  interval = null;
  sub: any = {};

  constructor(private zone: NgZone, private router: Router, private cacheSvc: CacheService) {
    this.interval = observableInterval(500).subscribe(() => {
      this.getCacheDate();
    });
  }

  getCacheDate() {
    this.cacheSvc.get('sub').subscribe(res => {
      const sub = isTrue(res) ? JSON.parse(res) : {};
      if (sub.page !== this.sub.page) {
        this.zone.run(() => {
          this.router.navigate(['/sub/' + sub.page]).then();
        });
      } else {
        this.router.navigate(['/sub/' + sub.page]).then();
      }
      this.sub = sub;
      this.cacheSvc.updateSubStatus(this.sub);
    });
  }

  ngOnDestroy() {
    if (this.interval) {
      this.interval.unsubscribe();
    }
  }
}
