import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavParams, ModalController } from '@ionic/angular';
import { MemberService } from '../../../../@theme/modules/member/member.service';
import { objectToArray } from '../../../../@core/utils/extend';
import {
  TicketChangeTypeService,
  ItemsInputDto,
  ChangeInputDto
} from '../../../../@theme/entryComponents/changeType/changeType.service';

import { TicketService } from '../../../ticket/ticket.service';

const getDefault = (selected) => {// 获取默认选中票类;算法：当所有影票的票类相同时才会有值
  const seats = objectToArray(selected);
  let uid = seats[0].uidTicketType;
  seats.forEach(seat => {
    if (seat.uidTicketType !== uid) {
      uid = '';
    }
  });
  return uid;
};

@Component({
  selector: 'app-change-type',
  templateUrl: './changeType.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './changeType.component.scss'],
  providers: [DatePipe]
})
export class CartChangeTypeComponent implements OnInit {
  seat: any;
  ticketTypes;

  constructor(private navParams: NavParams,
              private datePipe: DatePipe,
              private modalController: ModalController,
              private memberSvc: MemberService,
              private ticketSvc: TicketService,
              private changeTypeSvc: TicketChangeTypeService) {
    const member = memberSvc.currentMember;
    const seat = this.navParams.data.selected;
    const inputDto: ItemsInputDto = {
      uidMemberCardLevel: member ? member.card.uidCardLevel : '',
      uidPosResSeat: seat.uidPosResSeat
    };
    changeTypeSvc.items(inputDto).subscribe(res => {
      this.ticketTypes = res.data.detail;
      res.data.detail.forEach(ticketType => {
        if (seat.uidTicketType === ticketType.uidTicketType) {
          seat.ticketType = ticketType;
        }
      });
      this.seat = seat;
    });
  }

  ngOnInit() {
  }

  typeSelect(ticketType) {
    const inputDto: ChangeInputDto = {
      cartSeatPriceService: ticketType.seatPriceService,
      cartSeatPriceSupplyValue: ticketType.seatPriceSupplyValue,
      namePayMode: ticketType.namePayMode,
      ticketName: ticketType.ticketTypeName,
      ticketPirce: ticketType.seatPrice,
      uidCartPlanSeat: this.seat.uidPosResSeat,
      uidPayMode: ticketType.uidPayMode,
      uidTicketType: ticketType.uidTicketType
    };
    this.changeTypeSvc.change(inputDto).subscribe(res => {
      if (res.status.status === 0) {
        this.modalController.dismiss(true).then();
        const selected = this.ticketSvc.currentSelected;
        for (const uid in selected) {
          if (uid === this.seat.uidPosResSeat) {
            console.log(ticketType);
            selected[uid].ticketType = ticketType;
            selected[uid].levelPrice = {
              price: ticketType.seatPrice,
              seatLevel: this.seat.cartSeatLevel,
              seatLevelCode: ticketType.seatLevelCode,
              seatPriceService: ticketType.seatPriceService,
              seatPriceSupplyValue: ticketType.seatPriceSupplyValue
            };
          }
        }
        this.ticketSvc.updateSelectedStatus(selected);
      } else {
        this.modalController.dismiss().then();
      }
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

}
