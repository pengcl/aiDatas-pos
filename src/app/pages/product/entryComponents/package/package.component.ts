import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavParams, ModalController} from '@ionic/angular';
import {ProductService} from '../../product.service';
import {CartProductInputDto} from '../../../shopping-cart/shopping-cart.service';
import {SelectedPipe} from './package.pipe';

@Component({
  selector: 'app-product-package',
  templateUrl: './package.component.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', './package.component.scss'],
  providers: [DatePipe, SelectedPipe]
})
export class ProductPackageComponent {
  data: any;
  total: any;

  constructor(private navParams: NavParams,
              private modalController: ModalController,
              private selectedPipe: SelectedPipe,
              private productSvc: ProductService) {
    this.productSvc.package({uid: this.navParams.data.product.uidResource}).subscribe(res => {
      this.data = res.data;
      this.total = this.data.resComboPrice;
      res.data.containListDTOList.forEach(item => {
        item.selected = true;
      });
    });
  }

  select(item, i?) {
    if ((i && i.selected) || (!i && item.selected)) {// 已经选中
      return false;
    }
    item.selected = false;
    item.containRepListDTOList.forEach(rep => {
      rep.selected = false;
    });
    if (i) {
      i.selected = true;
    } else {
      item.selected = true;
    }
    let total = 0;
    this.data.containListDTOList.forEach(row => {
      const price = this.selectedPipe.transform(row, 'price');
      total = total + price;
    });
    this.total = total;
  }

  confirm() {
    const shopCartResContainList = [];
    let nameResStr = '';
    this.data.containListDTOList.forEach(item => {
      if (item.selected) {
        if (nameResStr) {
          nameResStr = nameResStr + ',' + item.resourceName;
        } else {
          nameResStr = item.resourceName;
        }
        shopCartResContainList.push({
          nameRes: item.resourceName,
          uidRes: item.uidResource,
          priceRes: item.resourcePrice,
          codeRes: item.resourceCode
        });
      } else {
        item.containRepListDTOList.forEach(i => {
          if (i.selected) {
            if (nameResStr) {
              nameResStr = nameResStr + ',' + i.resourceName;
            } else {
              nameResStr = i.resourceName;
            }
            shopCartResContainList.push({
              nameRes: i.resourceName,
              uidRes: i.uidResource,
              priceRes: i.addPriceType ? item.resourcePrice - i.addPriceValue : item.resourcePrice + i.addPriceValue,
              codeRes: i.resourceCode
            });
          }
        });
      }
    });
    let price = 0;
    shopCartResContainList.forEach(item => {
      price = price + item.priceRes;
    });
    const data: CartProductInputDto = {
      cartResName: this.data.resComboName,
      cartResPrice: price,
      cartResPriceOri: price,
      cartResType: 1,
      isPointsPay: 0,
      nameResStr,
      shopCartResContainList,
      uidResource: this.data.uid,
    };
    this.modalController.dismiss(data).then();
  }

  dismiss() {
    this.modalController.dismiss().then();
  }
}
