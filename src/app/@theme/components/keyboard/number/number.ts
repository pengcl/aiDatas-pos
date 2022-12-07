import {Component, Input, Output, EventEmitter} from '@angular/core';
import {isNonEmptyString} from 'ng-zorro-antd';

@Component({
  selector: 'app-keyboard-number',
  templateUrl: 'number.html',
  styleUrls: ['number.scss']
})
export class KeyboardNumberComponent {
  @Input() value = '';
  @Input() type;
  @Input() dotDisabled = false;
  @Output() valueChange = new EventEmitter();

  constructor() {
  }

  clickNumber(strNum: string, isCustom?, disabled?) {
    /*console.log(strNum, isCustom, disabled);*/
    if (disabled) {
      return false;
    }
    this.value = this.value === null ? this.value = '' : this.value.toString();

    /*console.log(this.value);
    this.value = this.value === null ? this.value = '' : (isNonEmptyString(this.value) ? this.value : this.value.toString());*/
    if (isCustom) {
      this.value = strNum;
    } else {
      if (strNum === 'del') {
        this.value = this.value.slice(0, this.value.length - 1);
      } else {
        this.value = this.value + strNum;
      }
    }
    this.valueChange.next(this.value ? this.value : '');
  }

}
