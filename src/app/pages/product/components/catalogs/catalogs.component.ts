import {Component, EventEmitter, Output, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AppService} from '../../../../app.service';
import {CatalogsInputDto, ProductService} from '../../product.service';
import {PageDto} from '../../../../@theme/modules/pagination/pagination.dto';
import {getPage, currentPageData} from '../../../../@theme/modules/pagination/pagination.component';

@Component({
  selector: 'app-product-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class ProductCatalogsComponent implements OnInit {
  @Input() catalog;
  @Output() catalogChange: EventEmitter<any> = new EventEmitter();
  items = [
    {
      categoryCode: 'QRIZYN020954',
      categoryName: '热卖商品',
      categoryOrderPos: 0,
      uid: 1, // uidPosCategory
      uidMerCategory: null // uidBaseCategory
    },
    {
      categoryCode: 'QRIZYN020954',
      categoryName: '全部套餐',
      categoryOrderPos: 0,
      uid: 1, // uidPosCategory
      uidMerCategory: 2 // uidBaseCategory
    }
  ];
  currentPageData;
  page: PageDto = {
    pageSize: 10,
    currentPage: 1
  };

  constructor(private appSvc: AppService, private productSvc: ProductService) {
    const height = document.body.offsetHeight - 155;
    this.page.pageSize = Math.floor(height / 53);
  }

  ngOnInit() {
    this.initData();
    this.select(this.items[0]);
  }

  initData() {
    const inputDto: CatalogsInputDto = {
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.productSvc.catalogs(inputDto).subscribe(res => {
      this.items = this.items.concat(res.data);
      this.page = getPage(this.items, this.page.pageSize);
      this.currentPageData = currentPageData(this.items, this.page);
    });
  }

  select(catalog) {
    this.catalog = catalog;
    this.catalogChange.next(this.catalog);
  }

  pageChange(e) {
    this.page = e;
    this.currentPageData = currentPageData(this.items, this.page);
  }

}
