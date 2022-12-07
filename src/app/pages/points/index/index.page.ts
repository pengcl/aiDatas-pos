import {Component, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {
  ShoppingCartService,
  AddItemsInputDto,
  CartProductInputDto,
  CartProductContainList
} from '../../shopping-cart/shopping-cart.service';
import {ProductService} from '../../product/product.service';
import {PointsService} from '../points.service';
import {currentPageData, getPage} from '../../../@theme/modules/pagination/pagination.component';
import {MemberService} from '../../../@theme/modules/member/member.service';
import {MemberComponent} from '../../../@theme/modules/member/member.component';

@Component({
  selector: 'app-points-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss']
})
export class PointsIndexPage {
  member;
  items;
  details;
  page = {
    currentPage: 1,
    pageSize: 12
  };
  show = false;
  currentPageData = currentPageData;
  @ViewChild('ionContent', {static: false}) private ionContent: any;
  grid = {x: 0, y: 0};

  constructor(private productSvc: ProductService,
              private shoppingCartSvc: ShoppingCartService,
              private memberSvc: MemberService,
              private pointsSvc: PointsService) {
  }

  ionViewDidEnter() {
    this.member = this.memberSvc.currentMember;
    this.items = [];
  }

  ionViewDidLeave() {
    // this.memberComponent.logout();
  }

  detailShow(e) {
    this.show = e;
  }

  memberChange(e) {
    if (e && !e.target) {
      this.member = e;
      this.getItems();
    } else {
      this.shoppingCartSvc.emptyCart().subscribe();
      this.member = null;
      this.items = [];
      this.details = null;
      this.page = getPage(this.items, this.page.pageSize);
    }
  }

  getItems() {
    let cardPoint = 0;
    if (this.member && this.member.card){
      cardPoint = this.member.card.cardPoint;
    }
    console.log('points', cardPoint);
    this.pointsSvc.items(cardPoint).subscribe(res => {
      this.items = res.data;
      this.getGrid();
    });
  }

  getGrid() {
    this.grid.x = Math.floor(this.ionContent.el.offsetWidth / 180);
    this.grid.y = Math.floor(this.ionContent.el.offsetHeight / 110);
    this.page.pageSize = this.grid.x * this.grid.y;
    this.page = getPage(this.items, this.page.pageSize);
  }

  add(item) {
    if (item.resourceStock === 0 && item.isCombo !== 1 && item.isSeviceMer !== 1 && item.isSelfMer !== 1) {
      return false;
    }
    let cardPoint = 0;
    if (this.member && this.member.card){
      cardPoint = this.member.card.cardPoint;
    }
    const inputDto: AddItemsInputDto = {
      memberAlias: this.member.memberAlias,
      memberCardLevelName: this.member.card.cardLevelName,
      memberCardNo: this.member.card.cardNo,
      memberMobile: this.member.memberMobile,
      uidMember: this.member.uid,
      uidMemberCard: this.member.card.uidMemberCard,
      uidMemberCardLevel: this.member.card.uidCardLevel,
      posShopCartResDTOList: []
    };
    if (item.isCombo) { // 如果是套餐
      this.productSvc.package({uid: item.uidResource, uidComp: item.uidComp}).subscribe(res => {
        const containItems: CartProductContainList[] = [];
        res.data.containListDTOList.forEach(contain => {
          const containItem = {
            nameRes: contain.resourceName,
            uidRes: contain.uidResource
          };
          containItems.push(containItem);
        });
        const productInputDto: CartProductInputDto = {
          cartResPrice: res.data.resComboPrice,
          cartResType: '4',
          isPointsPay: '1',
          pointsChangePoints: item.pointsChangePoints,
          pointsChangePrice: item.pointsChangePrice,
          totalPoints: cardPoint,
          uidResource: item.uidResource,
          shopCartResContainList: containItems
        };
        inputDto.posShopCartResDTOList = [productInputDto];
        this.createRes(inputDto);
      });
    } else {
      const productInputDto: CartProductInputDto = {
        cartResCode: item.resourceCode,
        cartResName: item.resourceName,
        cartResType: 0,
        isPointsPay: '1',
        isSelfMer: item.isSelfMer,
        isSeviceMer: item.isSeviceMer,
        pointsChangePoints: item.pointsChangePoints,
        pointsChangePrice: item.pointsChangePrice,
        totalPoints: cardPoint,
        uidComp: item.uidComp,
        uidResource: item.uidResource
      };
      inputDto.posShopCartResDTOList = [productInputDto];
      this.createRes(inputDto);
    }
  }

  createRes(inputDto) {
    this.shoppingCartSvc.addV1(inputDto).subscribe(res => {
      if (res.status.status === 0) {
        this.getDetails();
        this.getItems();
      }
    });
  }

  getDetails() {
    this.shoppingCartSvc.details().subscribe(res => {
      this.details = res.data;
    });
  }

  change(e) {// 用change关键字不能包含表单类型控件
    if (typeof e === 'boolean') {
      this.getItems();
      this.getDetails();
    }
  }

  pageChange(e) {
    this.page = e;
  }
}
