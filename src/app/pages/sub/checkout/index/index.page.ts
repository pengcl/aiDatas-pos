import {Component, NgZone, OnInit, OnDestroy} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {CacheService} from '../../../../@core/utils/cache.service';
import {interval as observableInterval} from 'rxjs/internal/observable/interval';
import {Router} from '@angular/router';
import {SubService} from '../../sub.service';
import {MemberService} from '../../../../@theme/modules/member/member.service';
import {isTrue} from '../../../../@core/utils/extend';

import {MemberCardComponent} from '../../../../@theme/modules/member/entryComponents/card/card';

@Component({
  selector: 'app-sub-checkout-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: []
})
export class SubCheckoutIndexPage implements OnInit {
  sub: any = {};
  subscribe;
  cart;
  activities;
  payDetails;
  member;
  cardModal;

  constructor(private zone: NgZone,
              private modalController: ModalController,
              private memberSvc: MemberService,
              private router: Router,
              private cacheSvc: CacheService,
              private subSvc: SubService) {
  }

  ngOnInit() {
    this.subscribe = this.cacheSvc.getSubStatus().subscribe(res => {
      const sub = isTrue(res) ? res : {};
      if (!this.sub) {
        this.init(sub);
      }
      if (this.sub.updateTime !== sub.updateTime) {
        this.init(sub);
      }
    });
  }

  async presentCardModal(memberLoginOutputData) {
    this.cardModal = await this.modalController.create({
      animated: false,
      showBackdrop: true,
      backdropDismiss: false,
      component: MemberCardComponent,
      cssClass: 'member-card-modal sub-modal',
      componentProps: {memberLoginOutputData}
    });
    await this.cardModal.present();
    await this.cardModal.onDidDismiss();
  }

  init(sub) {
    this.sub = sub;
    this.cart = this.sub.shoppingCart;
    this.activities = this.sub.activities;
    this.payDetails = this.sub.payDetails;
    if (!this.cardModal && this.sub.showCardStatus) {
      this.presentCardModal(this.sub.showCardStatus.memberLoginOutputData).then();
    }
    if (this.cardModal && !this.sub.showCardStatus) {
      this.cardModal.dismiss().then(() => {
        this.cardModal = null;
      });
    }
    this.member = this.sub.member;
    this.memberSvc.updateMemberStatus(this.member);
    this.memberSvc.updateCardStatus(this.member ? this.member.card : {});
  }

}
