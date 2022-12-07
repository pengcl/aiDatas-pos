import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {objectToArray} from '../../../@core/utils/extend';
import {MemberService} from '../../modules/member/member.service';
import {IsOptionalPipe} from '../../pipes/pipes.pipe';

@Component({
  selector: 'app-ticket-change-type',
  templateUrl: './changeType.component.html',
  styleUrls: ['../../../../theme/ion-modal.scss', './changeType.component.scss'],
  providers: [DatePipe, IsOptionalPipe]
})
export class TicketChangeTypeComponent implements OnInit {
  data: any;
  seatSelected = {};
  typeSelected: any = {};
  member;
  seats = [];

  constructor(private navParams: NavParams,
              private datePipe: DatePipe,
              private isOptionalPipe: IsOptionalPipe,
              private modalController: ModalController,
              private memberSvc: MemberService) {
    const seats = [];
    const selected = this.navParams.data.selected;
    for (const key in selected) {
      if (selected[key]) {
        seats.push(selected[key]);
      }
    }
    seats.sort((a, b) => {
      return Number(a.resSeatRow + a.resSeatCol) - Number(b.resSeatRow + b.resSeatCol);
    });
    this.seats = seats;
    this.data = this.navParams.data;
    this.member = this.memberSvc.currentMember;
    if (this.count.all <= 1) {
      this.selectAll({checked: true});
    }
  }

  ngOnInit() {
  }

  seatSelect(seat) {
    if (this.count.all <= 1) {
      return false;
    }
    if (this.seatSelected[seat.uid]) {
      this.seatSelected[seat.uid] = false;
    } else {
      this.seatSelected[seat.uid] = seat;
    }
  }

  typeSelect(ticketType) {
    const optional = this.isOptionalPipe.transform(ticketType, this.member);
    if (!optional) {
      return false;
    }
    const array = objectToArray(this.seatSelected);
    if (array.length === 0) {
      return false;
    }
    this.typeSelected = ticketType;
    array.forEach(seat => {
      seat.ticketType = ticketType;
      seat.levelPrice = seat.ticketType.levelPriceDTO.filter(item => {
        return seat.resSeatLevelCode === item.seatLevelCode;
      })[0];
    });
    this.setAnimate();
    this.seatSelected = {};
    this.typeSelected = {};
    if (this.data.buttonDismiss) {
      this.modalController.dismiss(ticketType).then();
    }
  }

  setAnimate() {
    // 动画字段 changing;
    for (const uid in this.data.selected) {
      if (this.seatSelected[uid]) {
        this.data.selected[uid].changing = true;
        setTimeout(() => {
          this.data.selected[uid].changing = false;
        }, 100);
      }
    }
  }

  selectAll(e) {
    for (const uid in this.data.selected) {
      if (this.data.selected[uid]) {
        this.seatSelected[uid] = e.checked ? this.data.selected[uid] : false;
      }
    }
  }

  get count() {
    const all = objectToArray(this.data.selected).length;
    const seatSelected = objectToArray(this.seatSelected).length;
    return {
      all,
      seatSelected
    };
  }

  get disabled() {
    let disabled = true;
    for (const uid in this.seatSelected) {
      if (this.seatSelected[uid]) {
        disabled = false;
        break;
      }
    }
    return disabled;
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

}
