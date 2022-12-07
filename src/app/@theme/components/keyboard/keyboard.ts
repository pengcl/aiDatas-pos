import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-keyboard',
  templateUrl: 'keyboard.html',
  styleUrls: ['keyboard.scss']
})
export class KeyboardComponent {
  @Input() prev = false;
  @Input() next = false;
  @Input() value = '';
  @Input() type;
  @Input() dotDisabled = false;
  @Output() valueChange = new EventEmitter();
  @Output() keyChange: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  clickNumber(strNum: string) {
    this.value = this.value === null ? this.value = '' : this.value.toString();
    if (strNum === 'del') {
      this.value = this.value.slice(0, this.value.length - 1);
    } else if (strNum === 'clean') {
      this.value = '';
    } else {
      this.value = this.value + strNum;
    }
    this.valueChange.next(this.value ? this.value : '');
  }

  clickKey(key: string) {
    this.keyChange.next(key);
  }

}
