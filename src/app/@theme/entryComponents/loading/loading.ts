import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: 'loading.html',
  styleUrls: ['loading.scss']
})
export class LoadingComponent {
  @Input() icon = 'reload-outline';
  @Input() title = '加载中...';
  @Input() desc = '';
  constructor() {
  }

}
