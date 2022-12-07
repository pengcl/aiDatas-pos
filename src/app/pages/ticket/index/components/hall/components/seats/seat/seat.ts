import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-seat',
  templateUrl: 'seat.html',
  styleUrls: ['seat.scss']
})
export class SeatComponent implements OnChanges {
  /*@Input() name;
  @Input() seatType: 'seatType_bz' | 'seatType_ql' | 'seatType_dg' = 'seatType_bz';
  @Input() aloneSell: 0 | 1 = 0;
  @Input() seatReserve: 0 | 1 = 0;
  @Input() seatLevel: 'seatLevel0' | 'seatLevel1' | 'seatLevel2' | 'seatLevel3' | 'seatLevel4' | 'seatLevel5' = 'seatLevel0';*/
  // resSeatSaleCh: 0|3;3:网络
  // resSeatSaleStatus: -1|0;-1:已售
  // isOwned:0|1; 0:非本机锁,1;本机锁
  // status:-1|0; -1:不可销售 坏座,0:可销售
  // resSeatReserve:0|1|2; 0:可销售,1:锁定,2:预订
  @Input() seat: any;
  @Input() selected: boolean;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.seat && changes.seat.currentValue && changes.seat.currentValue !== changes.seat.previousValue) {
    }
  }

}
