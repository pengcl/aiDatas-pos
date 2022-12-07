import {Component, ViewChild, OnInit, AfterViewInit, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {NzMessageService} from 'ng-zorro-antd/message';
import {VipEditComponent} from '../entryComponents/edit/edit.component';
import {ResetPasswordComponent} from '../../../@theme/entryComponents/reset/reset.component';
import {VipUpdateComponent} from '../entryComponents/update/update.component';
import {AppService} from '../../../app.service';
import {VipService} from '../vip.service';
import {VipSearchComponent} from '../components/search/search.component';
import {ToastService} from '../../../@theme/modules/toast';
import {AuthService} from '../../auth/auth.service';
import {MemberService} from '../../../@theme/modules/member/member.service';
import {ShoppingCartService} from '../../shopping-cart/shopping-cart.service';
import {CheckAuth} from '../../../@core/utils/check-auth';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-vip-index',
  templateUrl: './index.page.html',
  styleUrls: ['../../../@theme/modules/mask/mask.component.scss', './index.page.scss'],
  providers: [NzMessageService]
})
export class VipIndexPage implements OnInit, AfterViewInit {
  queryParams; // 会员查询条件
  settingShow = false;
  cinema = this.appSvc.currentCinema;
  memberDetail;
  cardLength;
  effectiveTicketCount;
  @ViewChild('ionContent', {static: false}) private ionContent: any;
  tabsHeight = 'auto';
  @ViewChild('searchComponent', {static: false}) private searchComponent: VipSearchComponent;
  leavePage = '';
  didEnter = false;
  form: FormGroup = new FormGroup({
    cardType: new FormControl(1, [Validators.required]),
    conditions: new FormControl('', [Validators.required])
  });

  constructor(private modalController: ModalController,
              private route: ActivatedRoute,
              private location: LocationStrategy,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private appSvc: AppService,
              public authSvc: AuthService,
              private memberSvc: MemberService,
              private vipService: VipService,
              private shoppingCart: ShoppingCartService,
              private checkAuth: CheckAuth) {
    this.vipService.getFreshStatus().subscribe(res => {
      console.log('getFreshStatus', res);
      if (res) {
        if (res.caller === 'billCompelete') {
          console.log('billCompelete');
          this.queryMember();
        } else if (res.caller === 'reset') {
          console.log('reset');
          this.memberDetail = null;
          this.vipService.clearMemberDetail();
          this.searchComponent.resetCondition();
        }
      }
    });
  }

  ngOnInit() {
    console.log('ngOnInit');
  }

  get isShowMenu() {
    return typeof this.route.snapshot.queryParams.shoppingCart !== 'string';
  }

  askForUpdateMember(e) {
    if (!this.route.snapshot.queryParams.cardNo) {
      return false;
    }

    this.form.get('conditions').setValue(e ? e : this.memberDetail.cardSeleted.cardNo);
    if (this.form.invalid) {
      return false;
    }
    this.memberSvc.login(this.form.value).subscribe(res => {
      // this.setMember(data, data.memberReCardDTOs[0]);
      this.memberSvc.setMember(res.data, res.data.memberReCardDTOs[0]).subscribe(member => {
        console.log(member);
      });
    });

  }

  ngAfterViewInit() {
    // setTimeout(() => {
    // });
  }

  ionViewDidEnter() {
    this.didEnter = true;
  }

  ionViewDidLeave(e) {
    this.didEnter = false;
    console.log('离开会员页，清空信息', e);
    if (this.leavePage === 'checkout') {
      this.leavePage = '';
    } else {
      this.memberDetail = null;
      this.vipService.clearMemberDetail();
      this.searchComponent.resetCondition();
    }
  }

  show() {
    this.settingShow = !this.settingShow;
  }

  hide() {
    this.settingShow = false;
  }

  // 接受参数组件数据
  queryMemberParamsChange(e) {
    console.log('会员查询参数变化了', e);
    this.queryParams = e;
    this.queryMember();
  }

  // 查询会员
  queryMember() {
    const params = this.queryParams;
    params.notErrorInterceptor = true;
    console.log('查询参数', params);
    this.toastSvc.loading('正在查询，请稍后...', 0);
    this.vipService.memberQuery(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        // console.log('接口返回会员信息-->', res.data);
        const memberDetail = this.dealCard(res.data);
        this.memberDetail = memberDetail;
        this.setCardLength(this.memberDetail);
        this.effectiveTicketCount = this.memberDetail.effectiveTicketCount;
        setTimeout(() => {
          const contentHeight = this.ionContent.el.offsetHeight;
          const searchHeight = this.ionContent.el.children[0].offsetHeight;
          const infoHeight = this.ionContent.el.children[1].offsetHeight;
          const tabsHeight = contentHeight - searchHeight - infoHeight - 20 - 70;
          console.log(tabsHeight);
          this.tabsHeight = tabsHeight + 'px';
        });
        this.vipService.updateMemberDetail(memberDetail);
      } else {
        this.memberDetail = null;
        this.vipService.clearMemberDetail();
        this.message.error(res.status.msg2Client);
      }
    });
  }

  // 会员卡处理
  dealCard(memberDetail) {
    if (memberDetail.status === 0) {
      memberDetail.statusName = '正常';
    } else if (memberDetail.status === -1) {
      memberDetail.statusName = '停用';
    } else {
      memberDetail.statusName = '';
    }
    memberDetail.sexName = (memberDetail.memberSex === 0 ? '男' : '女');
    if (memberDetail.memberBirthMonth && memberDetail.memberBirthDay) {
      memberDetail.birthDay = '' + memberDetail.memberBirthMonth + '/' + memberDetail.memberBirthDay;
    }
    const cardList = memberDetail.memberReCardDTOs;
    const cards = memberDetail.memberReCardDTOs.filter(item => {
      return !(item.overdue === 1 || item.reCardStatus !== 0) && item.reCardStatus !== -1 && item.reCardStatus !== -2 && item.overdue !== 1;
    });
    console.log(cards);
    if (cardList && cardList.length > 0) {
      memberDetail.memberReCardDTOs = cardList;
      const params = this.queryParams;
      if (params && params.cardNo) {
        for (const card of cards) {
          if (card.cardNo === params.cardNo) {
            memberDetail.cardSeleted = card;
            break;
          }
        }
        if (!memberDetail.cardSeleted) {
          memberDetail.cardSeleted = cards[0];
        }
      } else {
        memberDetail.cardSeleted = cards[0];
      }
    }
    return memberDetail;
  }

  // 设置会员卡张数
  setCardLength(memberDetail) {
    if (memberDetail) {
      if (memberDetail.memberReCardDTOs) {
        this.cardLength = memberDetail.memberReCardDTOs.length;
      } else {
        this.cardLength = 0;
      }
    } else {
      this.cardLength = 0;
    }
  }

  authModal(type) {
    const map = {
      operEditData: {authFuctionCode: 'operEditData'},
      operEditPws: {authFuctionCode: 'operEditPws'},
      operRePws: {authFuctionCode: 'operRePws'}
    };
    const obj = map[type];
    if (obj) {
      obj.authFuctionType = '2';
      obj.uidAuthFuction = this.memberDetail.uid;
      this.checkAuth.auth(obj, type, () => {
        this.openAuthPage(type);
      });
    }
  }

  openAuthPage(type) {
    if (type === 'operEditData') {
      this.presentEditModal();
    } else if (type === 'operEditPws') {
      this.presentUpdateModal();
    } else {
      this.presentResetModal();
    }
  }

  // 修改资料
  async presentEditModal() {
    const detail = this.memberDetail;
    if (detail === undefined || detail.memberMobile === undefined) {
      return;
    }
    const cardList = detail.memberReCardDTOs; // 会员卡列表
    let defualMemberCardUid = '';
    if (cardList && cardList.length > 0) {
      cardList.forEach(item => {
        if (item.isDefaultCard === 1) {
          defualMemberCardUid = item.uidMemberCard;
          return;
        }
      });
    }
    const info = {
      memberUid: detail.uid,
      memberMobile: detail.memberMobile, // 手机号
      memberEmail: detail.memberEmail, // 邮箱
      memberIdCard: detail.memberIdCard, // 身份证
      memberQQ: detail.memberQQ, // 身份证
      memberSex: detail.memberSex, // 性别
      memberAlias: detail.memberAlias, // 昵称
      memberBirth: detail.memberBirth, // 生日
      memberWX: detail.memberWX, // 微信
      memberBirthMonth: detail.memberBirthMonth,
      memberBirthDay: detail.memberBirthDay,
      defualMemberCardUid // 默认卡
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: VipEditComponent,
      componentProps: {info, cardList}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.searchComponent.query();
    }
    this.hide();
  }

  // 重置密码
  async presentResetModal() {
    const detail = this.memberDetail;
    if (detail === undefined || detail.memberMobile === undefined) {
      return;
    }
    const params = {
      memberUid: detail.uid
    };
    console.log('重置密码', detail);
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ResetPasswordComponent,
      componentProps: {params}
    });
    await modal.present();
    await modal.onDidDismiss(); // 获取关闭传回的值
    this.hide();
  }

  // 修改密码
  async presentUpdateModal() {
    const detail = this.memberDetail;
    if (detail === undefined || detail.memberMobile === undefined) {
      return;
    }
    const params = {
      memberUid: detail.uid
    };
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: VipUpdateComponent,
      componentProps: {params}
    });
    await modal.present();
    await modal.onDidDismiss(); // 获取关闭传回的值
    this.hide();
  }

  emitLavePage(e) {
    this.leavePage = e;
  }

  back() {
    const shoppingCart = this.route.snapshot.queryParams.shoppingCart;
    console.log(shoppingCart);
    this.shoppingCart.setCurrentCart(shoppingCart);
    this.location.back();
  }
}
