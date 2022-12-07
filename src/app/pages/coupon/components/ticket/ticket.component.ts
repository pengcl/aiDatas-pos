import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DialogService } from '../../../../@theme/modules/dialog';
import { CouponService, TicketListInputDto, ContainInputDto } from '../../coupon.service';

import { CouponAddComponent } from '../../entryComponents/add/add.component';

@Component({
  selector: 'app-coupon-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class CouponTicketComponent implements OnChanges{
  items;
  @Input() didEnter;

  constructor(private modalController: ModalController,
              private dialogSvc: DialogService,
              private couponSvc: CouponService) {
    // this.presentAddModal().then();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.didEnter.currentValue !== changes.didEnter.previousValue && changes.didEnter.currentValue) {
      this.couponSvc.list().subscribe(res => {
        this.items = res.data.ticketSetDetails;
      });
    }
  }

  async presentAddModal(item) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: CouponAddComponent,
      componentProps: {item}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      const inputDto: TicketListInputDto[] = [];
      if (item) {
        const containInputDto: ContainInputDto[] = [];
        data.forEach(i => {
          containInputDto.push({
            ticketName: i.ticketName,
            ticketCode: i.ticketCode,
            ticketPrice: i.ticketPrice,
            validDateStr: i.validityPeriod,
            validDate: `(有效期至${i.validityPeriod.split('～')[1]})`
          });
        });
        inputDto.push({
          ticketName: item.ticketSetName,
          ticketCode: item.setCode,
          ticketPrice: item.unitPrice,
          cartTicketContainDTOList: containInputDto
        });
      } else {
        data.forEach(i => {
          inputDto.push({
            ticketName: i.ticketName,
            ticketCode: i.ticketCode,
            ticketPrice: i.ticketPrice,
            validDateStr: `(${i.validityPeriod})`,
            cartTicketContainDTOList: []
          });
        });
      }
      const selected = this.couponSvc.currentSelected.concat(inputDto);
      this.couponSvc.updateSelectedStatus(selected);
    }
  }

  select(item?) {
    if (item) {
      this.presentAddModal(item).then();
    } else {
      this.presentAddModal('').then();
    }
  }
}
