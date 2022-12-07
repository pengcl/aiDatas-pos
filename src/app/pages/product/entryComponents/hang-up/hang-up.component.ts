import { Component, EventEmitter, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastService } from '../../../../@theme/modules/toast';
import { DialogService } from '../../../../@theme/modules/dialog';
import { ShoppingCartService } from '../../../shopping-cart/shopping-cart.service';
import { ProductService } from '../../product.service';
import { objectToArray } from '../../../../@core/utils/extend';

const groupItems = (data) => {
  const selected = {};
  data.forEach(item => {
    if (selected[item.uidResource]) {
      selected[item.uidResource].count = selected[item.uidResource].count + 1;
    } else {
      item.count = 1;
      selected[item.uidResource] = item;
    }
  });
  const items = objectToArray(selected);
  return items;
};

@Component({
  selector: 'app-hang-up',
  templateUrl: './hang-up.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './hang-up.component.scss']
})
export class HangUpComponent {
  @Output() created: EventEmitter<any> = new EventEmitter();
  @Output() changeCart: EventEmitter<any> = new EventEmitter();
  @Output() deleted: EventEmitter<any> = new EventEmitter();
  items;

  constructor(private modalController: ModalController,
              private toastSvc: ToastService,
              private dialogSvc: DialogService,
              private shoppingCartSvc: ShoppingCartService) {
    this.getData();
  }

  getData() {
    this.shoppingCartSvc.list().subscribe(res => {
      if (res.data) {
        res.data.forEach(item => {
          item.items = groupItems(item.posShopCartResListDTOList);
        });
        this.items = res.data;
      }
    });
  }

  create() {
    this.toastSvc.loading('创建中...', 0);
    this.shoppingCartSvc.updateStatus().subscribe(res => {
      this.toastSvc.hide();
      this.toastSvc.success('创建成功', 1000);
      if (res.status.status === 0) {
        this.createCart();
      }
    });
  }

  createCart() {
    this.shoppingCartSvc.createCart().subscribe(res => {
      this.shoppingCartSvc.setCurrentCart(res.data.uid);
      this.created.next(true);
    });
  }

  change(item) {
    const uidShopCartOri = this.shoppingCartSvc.currentCart;
    this.shoppingCartSvc.setCurrentCart(item.uidShopCart);
    this.changeCart.next(uidShopCartOri);
  }

  del(item) {
    this.toastSvc.loading('删除中...', 0);
    this.shoppingCartSvc.delCart(item.uidShopCart).subscribe(res => {
      this.toastSvc.hide();
      this.toastSvc.success('删除成功', 1000);
      this.deleted.next(true);
      this.getData();
    });
  }

  askForDelete(item) {
    this.dialogSvc.show({content: '是否确定删除挂单?', cancel: '不了', confirm: '是的'}).subscribe(res => {
      if (res.value) {
        this.del(item);
      }
    });
  }
}
