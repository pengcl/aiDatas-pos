import {AfterViewInit, Component} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {BookdetailService} from './bookdetail.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {SnackbarService} from '../../../../../../../@core/utils/snackbar.service';
import {ToastService} from '../../../../../../../@theme/modules/toast';
import {DelayedComponent} from '../../../../../../../@theme/entryComponents/delayed/delayed';
import {NzModalService} from 'ng-zorro-antd/modal';
import {AuthService} from '../../../../../../auth/auth.service';
import {ShoppingCartService} from '../../../../../../shopping-cart/shopping-cart.service';
import {checkRedirect} from '../../../../../../../@core/utils/extend';

@Component({
  selector: 'app-bookdetail',
  templateUrl: 'bookdetail.component.html',
  styleUrls: ['../../../../../../../../theme/ion-modal.scss', 'bookdetail.component.scss'],
  providers: [NzMessageService, NzModalService]
})

export class BookdetailComponent implements AfterViewInit {

  params = this.navParams.data.params;
  detail;

  constructor(private modalController: ModalController,
              private snackbarSvc: SnackbarService,
              private authSvc: AuthService,
              private navParams: NavParams,
              private bookdetailSvc: BookdetailService,
              private message: NzMessageService,
              private toastSvc: ToastService,
              private shoppingCartSvc: ShoppingCartService,
              private nzmodal: NzModalService) {
  }

  ngAfterViewInit() {
    console.log(this.params);
    this.initDatas();
  }

  initDatas() {
    const pars = {
      seatCode: this.params.resSeatCode,
      uidPosResource: this.params.uidResource,
      notErrorInterceptor: true
    };
    this.toastSvc.loading('正在处理...', 30000);
    this.bookdetailSvc.getReserveDetail(pars).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        const arr = [];
        const uidSeats = [];
        res.data.posReserveSeatDTOList.forEach(item => {
          arr.push(item.cartSeatRow + '排' + item.cartSeatCol + '号(' + item.cartSeatLevel + '座)');
          uidSeats.push(item.uid);
        });
        res.data.uidSeats = uidSeats;
        res.data.listName = arr.join('；');
        this.detail = res.data;
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  delayed() {
    const params = {
      showTimeStart: this.params.posStartTime,
      uidList: this.detail.uidSeats
    };
    this.delayedModal(params);
  }

  // 显示延时界面
  async delayedModal(params) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: DelayedComponent,
      componentProps: {params},
      cssClass: 'delayed-modal'
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.message.success('延时成功!', {nzDuration: 2000});
      setTimeout(() => {
        this.initDatas();
      }, 500);
    }
  }

  pay() {
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.error.seats) {
        this.snackbarSvc.show('您已经选择了座位，无法支付取票', 2000);
      } else {
        this.handleToPay();
      }
    });
  }

  handleToPay(){
    const params = {
      uidShopCart: this.detail.uidShopCart,
      terminalCode: this.authSvc.currentTerminalCode
    };
    this.toastSvc.loading('数据加载中...', 10000);
    this.bookdetailSvc.pickUpTicket(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        const data = {status: 2, uidShopCart: this.detail.uidShopCart};
        this.closeModal(data);
      }
    });
  }

  unlock() {
    this.nzmodal.confirm({
      nzTitle: '是否确认解锁座位？',
      nzContent: '',
      nzOkText: '确认',
      nzOkType: 'primary',
      // nzOkDanger: true,
      nzOnOk: () => {
        const params = {
          uidShopCart: this.params.uidPosShopCart
        };
        this.toastSvc.loading('正在解锁...', 20000);
        this.bookdetailSvc.unlock(params).subscribe(res => {
          this.toastSvc.hide();
          if (res.status.status === 0) {
            this.message.success('解锁成功!', {nzDuration: 2000});
            const data = {status: 1};
            this.closeModal(data);
          } else {
            this.message.error('解锁失败!', {nzDuration: 2000});
          }
        });
      },
      nzCancelText: '取消',
      nzOnCancel: () => {
      }
    });
  }

  close() {
    const data = {status: 0};
    this.closeModal(data);
  }

  closeModal(data) {
    this.modalController.dismiss(data).then();
  }

}
