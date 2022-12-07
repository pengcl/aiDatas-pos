import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {PublicUtils} from '../../../@core/utils/public-utils';
import {ToastService} from '../toast';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CreateMemberCardInputDto, MemberService} from './member.service';
import {SubService} from '../../../pages/sub/sub.service';
import {MemberLoginComponent} from './entryComponents/login/login';
import {MemberCardComponent} from './entryComponents/card/card';
import {ShoppingCartService} from '../../../pages/shopping-cart/shopping-cart.service';

@Component({
  selector: 'app-member',
  templateUrl: 'member.component.html',
  styleUrls: ['member.component.scss'],
  providers: [NzMessageService]
})
export class MemberComponent {
  @Input() quickMode = false;
  @Input() notShare = false;
  @Input() locked = false;
  @Input() lockMessage = '';
  @Input() showVip = false;
  @Input() cart = null;
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() detailShow: EventEmitter<any> = new EventEmitter();
  member;
  card;
  form: FormGroup = new FormGroup({
    cardType: new FormControl(1, [Validators.required]),
    conditions: new FormControl('', [Validators.required])
  });
  show = false;

  constructor(private modalController: ModalController,
              private router: Router,
              private publicUtils: PublicUtils,
              private toastSvc: ToastService,
              private message: NzMessageService,
              private subSvc: SubService,
              private memberSvc: MemberService,
              public shoppingCartSvc: ShoppingCartService) {
    memberSvc.getMemberStatus().subscribe(res => {
      this.member = res;
    });
    memberSvc.getCardStatus().subscribe(res => {
      this.card = res;
    });
  }

  showMore() {
    this.show = !this.show;
    this.detailShow.next(this.show);
  }

  async presentCardModal(memberLoginOutputData) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: MemberCardComponent,
      cssClass: 'member-card-modal',
      componentProps: {memberLoginOutputData}
    });
    this.subSvc.updateSub('showCardStatus', {show: true, memberLoginOutputData});
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    this.subSvc.updateSub('showCardStatus', null);
    if (data) {
      this.setMember(memberLoginOutputData, data);
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: MemberLoginComponent,
      cssClass: 'member-login-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      data.memberReCardDTOs = data.memberReCardDTOs
      .filter(card => {
        return !(card.cardValidDate != null && card.cardValidDate !== '' && card.cardValidDate < (new Date()).getTime());
      });
      if (data.memberReCardDTOs.length > 1) { // 当有多张会员卡
        this.presentCardModal(data).then();
      } else {
        this.setMember(data, data.memberReCardDTOs[0], true);
      }
    }
  }

  setMember(member, card, isSingle?) {
    if (this.router.url.indexOf('checkout') !== -1) {
      if (this.cart.prePayList.length > 0) {
        this.memberSvc.addMember(member, card, isSingle).subscribe(res => {
          this.change.emit(res);
        });
      } else {
        this.shoppingCartSvc.reduction().subscribe(() => {
          this.memberSvc.addMember(member, card, isSingle).subscribe(res => {
            this.change.emit(res);
          });
        });
      }
    } else {
      this.memberSvc.setMember(member, card, isSingle).subscribe(res => {
        this.change.emit(res);
      });
    }
  }

  changeCard() {
    if (this.locked) {
      this.message.error(this.lockMessage + '，无法更换会员卡', {nzDuration: 5000});
      return false;
    }
    if (this.member.memberReCardDTOs.length === 1) {
      this.message.info('该会员只有一张会员卡！');
      return false;
    }
    this.presentCardModal(this.member).then();
  }

  login() {
    this.presentModal().then();
  }

  logout() {
    console.log('logout');
    if (this.locked) {
      this.message.error(this.lockMessage + '，无法注销会员', {nzDuration: 5000});
      return false;
    }
    if (this.member && !this.locked) {
      this.memberSvc.logout(this.card.bussinessUid).subscribe(res => {
        if (res.status.status === 0) {
          this.clear();
        }
      });
    }
  }

  query() {
    if (this.form.valid) {
      this.toastSvc.loading('查询中...', 0);
      this.memberSvc.login(this.form.value).subscribe(res => {
        this.toastSvc.hide();
        res.data.memberReCardDTOs = res.data.memberReCardDTOs
        .filter(card => {
          return !(card.cardValidDate != null && card.cardValidDate !== '' && card.cardValidDate < (new Date()).getTime());
        });
        if (res.data.memberReCardDTOs.length <= 1) {
          this.setMember(res.data, res.data.memberReCardDTOs[0]);
        } else {
          this.presentCardModal(res.data).then();
        }
      });
    }
  }

  // 会员卡
  read() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('conditions').setValue(res.data);
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  clean() {
    this.member = null;
    this.card = null;
    this.memberSvc.updateMemberStatus(this.member);
    this.memberSvc.updateCardStatus(this.card);
    this.change.emit(this.member);
  }

  clear() {
    this.form.get('conditions').setValue('');
    this.clean();
  }

}
