import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SnackbarService } from '../../../../@core/utils/snackbar.service';
import { AppService } from '../../../../app.service';
import { AuthService } from '../../../auth/auth.service';
import { ProductService, ProductsInputDto, AllProductsInputDto } from '../../product.service';
import { PageDto } from '../../../../@core/utils/extend';
import { ProductPackageComponent } from '../../entryComponents/package/package.component';
import { CartProductInputDto } from '../../../shopping-cart/shopping-cart.service';

import { getPage, currentPageData } from '../../../../@theme/modules/pagination/pagination.component';

// isSeviceMer 服务性商品
// isSelfMer 自制品
@Component({
  selector: 'app-product-goods',
  templateUrl: './goods.component.html',
  styleUrls: ['./goods.component.scss']
})
export class ProductGoodsComponent implements OnInit, OnChanges {
  @Input() catalog;
  @Output() catalogChange: EventEmitter<any> = new EventEmitter();
  page: PageDto = {
    pageSize: 10,
    currentPage: 1
  };
  products;
  selected;
  form: FormGroup = new FormGroup({
    no: new FormControl('', [Validators.required])
  });
  grid = {
    x: 0,
    y: 0
  };
  isStockShow = this.appSvc.isStockShow;
  @ViewChild('ionContent', {static: false}) private ionContent: any;

  constructor(private modalController: ModalController,
              private snackbarService: SnackbarService,
              private appSvc: AppService,
              private authSvc: AuthService,
              private productSvc: ProductService) {
    const width = (document.body.offsetWidth - 300) * (11 / 12);
    const height = document.body.offsetHeight - 155;
    const colWidth = width < 1080 ? 180 : 180;
    const colHeight = width < 1080 ? 115 : 115;
    this.grid.x = Math.floor(width / colWidth);
    this.grid.y = Math.floor(height / colHeight);
    this.page.pageSize = this.grid.x * this.grid.y;
  }

  ngOnInit() {
    console.log(this.isStockShow);
    this.productSvc.getSelectedStatus().subscribe(res => {
      this.selected = res;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.catalog && changes.catalog.currentValue) {
      this.page.currentPage = 1;
      this.getData();
    }
  }

  getData() {
    if (this.catalog.uidMerCategory === 2) {
      this.getAllProducts();
    } else {
      this.getCatalogProducts();
    }
  }

  setDisabled(products) {
    products.forEach(product => {
      if (!(product.isCombo === 1 || product.isSeviceMer === 1 || product.isSelfMer === 1) && product.resourceStock === 0) {
        product.disabled = true;
      }
    });
    return products;
  }

  getAllProducts() {
    const inputDto: AllProductsInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      page: {currentPage: this.page.currentPage, pageSize: this.page.pageSize},
      terminalCode: this.authSvc.currentTerminalCode,
      uidBaseCategory: this.catalog.uidMerCategory
    };
    this.productSvc.all(inputDto).subscribe(res => {
      const products = this.setDisabled(res.data.detail);
      this.products = products;
      this.page.totalPage = res.data.page.totalPage;
      this.page.totalSize = res.data.page.totalSize;
      this.page.currentPage = res.data.page.currentPage;
    });
  }

  getCatalogProducts() {
    const inputDto: ProductsInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      notShowUnenable: 1,
      page: {currentPage: this.page.currentPage, pageSize: this.page.pageSize},
      terminalCode: this.authSvc.currentTerminalCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    if (this.catalog.uidMerCategory) {
      inputDto.uidBaseCategory = this.catalog.uidMerCategory;
    } else {
      if (this.catalog.uid) {
        inputDto.uidPosCategory = this.catalog.uid;
      }
    }
    this.productSvc.items(inputDto).subscribe(res => {
      const products = this.setDisabled(res.data.detail);
      this.products = products;
      this.page.totalPage = res.data.page.totalPage;
      this.page.totalSize = res.data.page.totalSize;
      this.page.currentPage = res.data.page.currentPage;
    });
  }

  async presentModal(product) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: ProductPackageComponent,
      componentProps: {product}
    });
    await modal.present();
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    if (data) {
      this.selected.push(data);
      this.productSvc.updateSelectedStatus(this.selected);
    }
  }

  select(product) {
    if (product.disabled) {
      this.snackbarService.show('可售数量为0，不可点击', 2000);
      return false;
    }
    if (product.isCombo) {
      this.presentModal(product).then();
    } else {
      const data: CartProductInputDto = {
        cartResName: product.resourceName,
        cartResPrice: product.resourcePrice,
        cartResPriceOri: product.resourcePrice,
        cartResType: product.isCombo,
        isPointsPay: 0,
        nameResStr: product.resourceName,
        uidComp: product.uidComp,
        uidResource: product.uidResource
      };
      this.selected.push(data);
      this.productSvc.updateSelectedStatus(this.selected);
    }
  }

  query() {
    if (this.form.invalid) {
      return false;
    }
    this.catalog = null;
    this.catalogChange.next(this.catalog);
    this.productSvc.search(this.form.get('no').value).subscribe(res => {
      if (res.data.length !== 0) {
        this.form.reset();
      }
      this.products = this.setDisabled(res.data);
      this.page = getPage(res.data, this.page.pageSize);
      if (this.products.length === 1) {
        this.select(this.products[0]);
      }
    });
  }

  pageChange(e) {
    this.page = e;
    this.getData();
  }

}
