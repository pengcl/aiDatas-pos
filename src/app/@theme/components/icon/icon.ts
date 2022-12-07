import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: 'icon.html',
  styleUrls: ['icon.scss']
})
export class IconComponent {
  @Input() name;
  constructor() {
  }

}
