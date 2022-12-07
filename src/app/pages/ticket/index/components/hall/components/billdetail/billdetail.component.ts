import {AfterViewInit, Component} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {BillDetailService} from './billdetail.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ToastService} from '../../../../../../../@theme/modules/toast';
import {AuthService} from '../../../../../../auth/auth.service';
import {ShoppingCartService} from '../../../../../../shopping-cart/shopping-cart.service';
import {checkRedirect} from '../../../../../../../@core/utils/extend';


@Component({
  selector: 'app-billdetail',
  templateUrl: 'billdetail.component.html',
  styleUrls: ['../../../../../../../../theme/ion-modal.scss', 'billdetail.component.scss'],
  providers: [NzMessageService]
})

export class BillDetailComponent implements AfterViewInit{

  params = this.navParams.data.params;
  detail;
  billStatus = {
    NEW: '新建',
    SYS_CANCEL: '系统取消',
    USER_CANCEL: '用户取消',
    COMPLETE: '完成',
    FAIL: '失败',
    PAYING: '支付中'
  };
  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private shoppingCartSvc:ShoppingCartService,
              public authSvc: AuthService,
              private billdetailSvc: BillDetailService,
              private message: NzMessageService,
              private toastSvc: ToastService) {
  }

  ngAfterViewInit() {
    const pars = {
      resSeatCode: this.params.resSeatCode,
      uidResource: this.params.uidResource,
      notErrorInterceptor: true
    };
    this.toastSvc.loading('正在处理...', 30000);
    this.billdetailSvc.getBillSeatDetail(pars).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        let label = res.data.movieName + '(' + res.data.moviePublish + '/' + res.data.movieLanguage + ') /';
        label = label + res.data.showTimeStart + '/' + res.data.hallName;
        res.data.moiveDiplayName = label;
        if (res.data.resTakeStatus === 1){
          res.data.resTakeStatusDisplayName = '已取票';
        }else{
          res.data.resTakeStatusDisplayName = '未取票';
        }
        res.data.showStatus = this.billStatus[res.data.posBillStatus];
        const arr = [];
        res.data.billSeatDTOList.forEach(item => {
          let refund = '';
          if (item.isReject === 1){
            refund = '已退票';
          }
          arr.push(item.seatRow + '排' + item.seatCol + '座(' + item.seatLevel + ',' + item.ticketTypeName + ') ' + refund);
        });
        res.data.seatDetail = arr.join('；');
        res.data.seatLength = res.data.billSeatDTOList.length;
        this.detail = res.data;
      }else{
        this.message.error(res.status.msg2Client);
      }
    });
  }

  refundTicket(){
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.status) {
        const data = {
          status : 1,
          billCode: this.detail.billCode,
          target: '/refund/index'
        };
        this.closeModal(data);
      } else {
        this.message.warning('购物车还有商品，请先结算或清空购物车！');
      }
    });
  }

  reprintTicket(){
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.status) {
        const data = {
          status : 1,
          billCode: this.detail.billCode,
          target: '/reprint/index'
        };
        this.closeModal(data);
      } else {
        this.message.warning('购物车还有商品，请先结算或清空购物车！');
      }
    });
  }

  close() {
    const data = {
      status : 0
    };
    this.closeModal(data);
  }

  closeModal(data){
    this.modalController.dismiss(data).then();
  }

}
