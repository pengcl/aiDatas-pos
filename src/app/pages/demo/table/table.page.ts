import {Component, AfterViewInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-demo-table',
  templateUrl: './table.page.html',
  styleUrls: ['./table.page.scss']
})
export class DemoTablePage implements AfterViewInit {
  url = 'http://www.net.cn';

  constructor(private domSanitizer: DomSanitizer) {
  }

  ngAfterViewInit() {
  }

  ionViewDidEnter() {
  }

  ionViewDidLeave() {
  }

  change(e) {
    console.log(e);
  }

}
