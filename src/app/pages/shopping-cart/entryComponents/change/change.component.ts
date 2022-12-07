import {Component, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {listToTree} from '../../shopping-cart.utils';
import {ShoppingCartService, UpdateInputDto, PosShopCartResPriceItem} from '../../shopping-cart.service';
import {ToastService} from '../../../../@theme/modules/toast';
import {TreeTableComponent} from '../../../../@theme/modules/tree-table/component/tree-table.component';


@Component({
  selector: 'app-cart-change',
  templateUrl: './change.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './change.component.scss'],
  providers: [DatePipe]
})
export class ShoppingCartChangeComponent {
  items;
  type;
  title = '卖品调价';
  @ViewChild('table', {static: false}) private table: TreeTableComponent<any>;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private toastSvc: ToastService,
              private shoppingCartSvc: ShoppingCartService) {
    this.type = this.navParams.data.type;
    let keys;
    if (this.type === 'free') {
      this.title = '卖品赠送';
      keys = [
        {name: 'select', code: 'selected'},
        {name: '商品', code: 'cartResName'},
        {name: '数量', code: 'count'},
        {name: '原价(元)', code: 'cartResPrice'},
        {name: '赠送后(元)', code: 'newPrice'}
      ];
    } else {
      this.title = '卖品调价';
      keys = [
        {name: '商品', code: 'cartResName'},
        {name: '数量', code: 'count'},
        {name: '原价(元)', code: 'cartResPrice'},
        {name: '改后价(元)', code: 'newPrice'}
      ];
    }
    this.items = listToTree(this.navParams.data.products, keys);
  }

  confirm() {
    const dto: UpdateInputDto = {
      posShopCartResPriceList: []
    };
    if (this.type === 'free') {
      console.log(this.table.treeTable);
      this.table.treeTable.forEach(item => {
        if (item.dto.price === 0) {
          dto.posShopCartResPriceList.push({
            uid: item.dto.uid,
            cartResPrice: item.dto.price
          });
        }
      });
      this.toastSvc.loading('赠送中...');
    } else {
      this.table.treeTable.forEach(item => {
        if (item.dto.price !== item.dto.oldPrice) {
          dto.posShopCartResPriceList.push({
            uid: item.dto.uid,
            cartResPrice: item.dto.price
          });
        }
      });
      console.log(this.table.selection.selected);
      this.toastSvc.loading('改价中...');
    }
    this.shoppingCartSvc.update(dto).subscribe(res => {
      this.toastSvc.hide();
      this.modalController.dismiss(true).then();
    });
  }

  dismiss() {
    this.modalController.dismiss().then();
  }
}
