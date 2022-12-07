import { Component } from '@angular/core';
import { SubService } from '../../sub/sub.service';

@Component({
  selector: 'app-product-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss']
})
export class ProductIndexPage {
  catalog;
  didEnter = false;

  constructor(private subSvc: SubService) {
  }

  ionViewDidEnter() {
    this.didEnter = true;
    console.log(this.subSvc.currentOpen);
    if (!this.subSvc.currentOpen){
      this.open();
    }
  }

  ionViewDidLeave() {
    this.didEnter = false;
  }

  open() {
    if (this.subSvc.currentOpen) {
      return false;
    }
    this.subSvc.updateOpen(true);
    const url = location.origin + '/sub/sleeping';
    const aidaShell = (window as any).aidaShell;
    this.subSvc.updateSub('page', 'sleeping');
    if (aidaShell) {
      aidaShell.setSlaveScreenUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }

}
