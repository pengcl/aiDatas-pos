import {Component, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {MemberService} from '../../member.service';
import {TicketService} from '../../../../../pages/ticket/ticket.service';
import {PublicUtils} from '../../../../../@core/utils/public-utils';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-member-login',
  templateUrl: 'login.html',
  styleUrls: ['../../../../../../theme/ion-modal.scss', 'login.scss'],
  providers: [NzMessageService]
})
export class MemberLoginComponent implements AfterViewInit {
  form: FormGroup = new FormGroup({
    cardType: new FormControl(this.publicUtils.getCardType(), [Validators.required]),
    conditions: new FormControl('', [Validators.required])
  });

  @ViewChild('input', {static: false}) private input: ElementRef;

  constructor(private modalController: ModalController,
              private memberSvc: MemberService,
              private ticketSvc: TicketService,
              private message: NzMessageService,
              private publicUtils: PublicUtils) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 1000);
  }

  readCard() {
    this.publicUtils.readCardSerialNum((res) => {
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('conditions').setValue(res.data);
        }
      } else {
        this.message.error('读卡会员卡失败');
      }
    });
  }

  confirm() {
    if (this.form.valid) {
      const cardType = this.form.get('cardType').value;
      const conditions = this.form.get('conditions').value;
      const body: any = {cardType};
      if (cardType === 1) {
        body.conditions = conditions;
      } else {
        body.cardNoPhysical = conditions;
      }
      this.getMember(body);
    }
  }

  getMember(body) {
    if (this.ticketSvc.currentPlan) {
      body.uidScene = this.ticketSvc.currentPlan.uidPlan;
    }
    this.memberSvc.login(body).subscribe(res => {
      if (res.data) {
        this.modalController.dismiss(res.data).then();
      }
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }

  clickNumber(strNum: string) {
    let conditions = this.form.get('conditions').value;
    if (strNum === 'del') {
      conditions = conditions.slice(0, conditions.length - 1);
    } else {
      conditions = conditions + strNum;
    }
    this.form.get('conditions').setValue(conditions);
  }

}
