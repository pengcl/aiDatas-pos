import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {NavParams} from '@ionic/angular';
import {DialogService} from '../../../../@theme/modules/dialog';
import {CouponService, DetailInputDto, TicketDetailInputDto, TicketOutputDto} from '../../coupon.service';

@Component({
  selector: 'app-coupon-add',
  templateUrl: './add.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './add.component.scss']
})
export class CouponAddComponent {
  items: TicketOutputDto[] = [];
  form: FormGroup = new FormGroup({
    ticketCode: new FormControl('', [Validators.required]),
    ticketName: new FormControl('', []),
    ticketPrice: new FormControl('', []),
    validityPeriod: new FormControl('', []),
    checkResult: new FormControl('', []),
    isCheck: new FormControl(false, [])
  });
  item;

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private dialogSvc: DialogService,
              private couponSvc: CouponService) {
    this.item = this.navParams.data.item;
    console.log(this.item);
  }

  add() {
    const selected = this.couponSvc.currentSelected;
    const codes = [];
    selected.forEach(item => {
      if (item.cartTicketContainDTOList.length === 0) {
        codes.push(item.ticketCode);
      } else {
        item.cartTicketContainDTOList.forEach(i => {
          codes.push(i.ticketCode);
        });
      }
    });
    if (codes.indexOf(this.form.get('ticketCode').value) !== -1) {
      this.dialogSvc.show({content: '请不要添加重复的票券', cancel: '', confirm: '我知道了'}).subscribe();
      this.form.reset();
      return false;
    }
    this.items.push(this.form.value);
    this.form.reset();
  }

  remove(i) {
    this.items.splice(i, 1);
  }

  confirm() {
    const ticketDto: TicketDetailInputDto[] = [];
    this.items.forEach(item => {
      ticketDto.push({ticketCode: item.ticketCode});
    });
    const inputDto: DetailInputDto = {
      amount: '1',
      setCode: this.item ? this.item.setCode : '',
      ticketDetails: ticketDto
    };
    this.couponSvc.check([inputDto]).subscribe(res => {
      const items = res.data.salesDetails[0].ticketDetails;
      items.forEach(item => {
        item.isChecked = true;
      });
      this.items = items;
      if (res.data.code === '100603') {
        this.dialogSvc.show({content: '请删除不可锁售的票券！', cancel: '', confirm: '我知道了'}).subscribe();
      } else if (res.data.code === '0') {
        this.modalController.dismiss(this.items).then();
      }
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }
}
