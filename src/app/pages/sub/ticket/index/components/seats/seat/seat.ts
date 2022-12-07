import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-sub-seat',
  templateUrl: 'seat.html',
  styleUrls: ['seat.scss']
})
export class SubSeatComponent {
  @Input() seat: any;

  constructor() {
  }

}
