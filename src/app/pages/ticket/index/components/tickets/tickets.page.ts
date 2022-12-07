import { Component, NgZone, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TicketChangeTypeComponent } from '../../../../../@theme/entryComponents/changeType/changeType.component';
import { ShoppingCartService } from '../../../../shopping-cart/shopping-cart.service';
import { AppService } from '../../../../../app.service';
import { AuthService } from '../../../../auth/auth.service';
import { TicketService } from '../../../ticket.service';
import { MemberService } from '../../../../../@theme/modules/member/member.service';
import { SubService } from '../../../../sub/sub.service';
import { IsOptionalPipe } from '../../../../../@theme/pipes/pipes.pipe';

@Component({
  selector: 'app-ticket-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  providers: [IsOptionalPipe]
})
export class TicketTicketsComponent implements OnDestroy {
  plan = this.ticketSvc.currentPlan;
  ticketTypes = [];
  @Output() selectedChange = new EventEmitter();
  ticketType;
  selected = {};
  member;
  subscribe: any = {};

  constructor(private zone: NgZone,
              private router: Router, private modalController: ModalController,
              private appSvc: AppService,
              public authSvc: AuthService,
              private memberSvc: MemberService,
              private ticketSvc: TicketService,
              private subSvc: SubService,
              private isOptionalPipe: IsOptionalPipe,
              private shoppingCartSvc: ShoppingCartService) {
    this.subscribe.getPlanStatus = ticketSvc.getPlanStatus().subscribe(res => {
      this.plan = res;
    });
    this.subscribe.getInfoStatus = ticketSvc.getInfoStatus().subscribe(res => {
      this.ticketTypes = res ? res.ticketTypeList : [];
      this.getTicketType();
    });
    this.subscribe.getSelectedStatus = this.ticketSvc.getSelectedStatus().subscribe(res => {
      this.selected = res;
    });
    this.subscribe.getMemberStatus = this.memberSvc.getMemberStatus().subscribe(res => {
      this.member = res;
      this.getTicketType();
    });
  }

  getTicketType() {
    let ticketType;
    if (this.ticketTypes && this.ticketTypes.length > 0) {
      const ticketTypes = [];
      this.ticketTypes.forEach(item => {
        const isOptional = this.isOptionalPipe.transform(item, this.member);
        if (isOptional) {
          ticketTypes.push(item);
        }
      });
      // uidTicketType
      ticketType = ticketTypes.filter(item => item.ticketTypeName === '标准票')[0];
      if (this.member) {
        ticketType = ticketTypes.filter(item => item.uidMemCardLevels)[0] || ticketType;
      }
      this.typeChange(ticketType);
    }
  }

  typeChange(ticketType) {
    const isOptional = this.isOptionalPipe.transform(ticketType, this.member);
    if (isOptional) {// 判断是否可选
      this.ticketType = ticketType;
      this.ticketSvc.updateTicketTypeStatus(this.ticketType);
    }
  }

  async presentChangeModal() {
    const selected: any = {};
    for (const uid in this.selected) {
      if (this.selected[uid]) {
        selected[uid] = this.selected[uid];
      }
    }
    this.selected = selected;
    this.ticketSvc.updateSelectedStatus(this.selected);
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TicketChangeTypeComponent,
      componentProps: {ticketTypes: this.ticketTypes, selected: this.selected}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
    }
  }

  submit() {
    if (this.appSvc.currentLoading) {
      return false;
    }
    const seats = [];
    for (const uid in this.selected) {
      if (this.selected[uid]) {
        seats.push(this.selected[uid]);
      }
    }
    if (seats.length > 0) {
      this.zone.run(() => {
        this.router.navigate(['/checkout/index'], {
          queryParams: {
            uidShopCart: this.shoppingCartSvc.currentCart,
            businessType: 'SALE'
          }
        }).then();
      });
    } else {
      return false;
    }
  }

  goCart() {
    this.zone.run(() => {
      this.router.navigate(['/shoppingCart/index'], {queryParams: {target: 'ticket'}}).then();
    });
  }

  ngOnDestroy() {
    for (const key in this.subscribe) {
      if (this.subscribe[key]) {
        this.subscribe[key].unsubscribe();
      }
    }
  }
}
