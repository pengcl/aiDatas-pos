import {
  Component,
  NgZone,
  Input,
  Output,
  OnInit,
  OnChanges, SimpleChanges,
  EventEmitter
} from '@angular/core';
import {Router} from '@angular/router';

import {ToastService} from '../../../../@theme/modules/toast';
import {DialogService} from '../../../../@theme/modules/dialog';

import {PointsService, UpdateCountInputDto} from '../../points.service';
import {ShoppingCartService, DelItemsInputDto} from '../../../shopping-cart/shopping-cart.service';
import {PasswordService} from '../../../../@theme/modules/password';
import {groupSame} from '../../../shopping-cart/shopping-cart.utils';

const getLength = (items, uidResource) => {
  let count = 0;
  items.forEach(item => {
    if (item.uidResource === uidResource) {
      count = count + 1;
    }
  });
  return count;
};

@Component({
  selector: 'app-points-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class PointsCartComponent implements OnInit, OnChanges {
  @Input() items;
  @Input() member;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  groupItems;
  amount = {
    pointsChangePoints: 0,
    pointsChangePrice: 0
  };

  constructor(private zone: NgZone,
              private router: Router, private toastSvc: ToastService,
              private dialogSvc: DialogService,
              private passwordSvc: PasswordService,
              private shoppingCartSvc: ShoppingCartService, private pointsSvc: PointsService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items && changes.items.currentValue) {
      this.pointsSvc.updateSelectedStatus(this.items);
      this.groupItems = groupSame(this.items);
      this.amount = this.getAmount(this.groupItems);
    } else {
      this.pointsSvc.updateSelectedStatus([]);
      this.groupItems = null;
      this.amount = this.getAmount(this.groupItems);
    }
  }

  getAmount(items) {
    const amount = {
      pointsChangePoints: 0,
      pointsChangePrice: 0
    };
    if (items) {
      items.forEach(item => {
        amount.pointsChangePoints = amount.pointsChangePoints + (item.pointsChangePoints * item.count);
        amount.pointsChangePrice = amount.pointsChangePrice + (item.pointsChangePrice * item.count);
      });
    }
    return amount;
  }

  countChange(e, item) {
    if (typeof e === 'number') {
      const length = getLength(this.items, item.uidResource);
      if (e > length) {
        this.plus(item, Math.abs(e - length));
      }

      if (e < length) {
        this.minus(item, Math.abs(e - length));
      }
    }
  }

  minus(item, count) {
    this.update(item, count, '1');
  }

  plus(item, count) {
    this.update(item, count, '0');
  }

  update(item, count, calculationType) {
    console.log(item);
    let cardPoint = 0;
    if (this.member && this.member.card){
      cardPoint = this.member.card.cardPoint;
    }
    const inputDto: UpdateCountInputDto = {
      calculationType,
      isCombo: item.shopCartResContainList.length > 0 ? 1 : 0,
      isPointsPay: item.isPointsPay,
      number: count,
      totalPoints: cardPoint,
      uidPosResource: item.uidResource,
      uidShopCart: this.shoppingCartSvc.currentCart
    };
    this.pointsSvc.updateCount(inputDto).subscribe(res => {
      this.change.next(true);
    });
  }

  del(item) {
    console.log(item);
    const inputDto: DelItemsInputDto = {
      resType: 0,
      uidPosResource: item.uidResource
    };
    this.toastSvc.loading('删除中...', 0);
    this.shoppingCartSvc.batchDel(inputDto).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.change.next(true);
        this.toastSvc.success('删除成功', 1000);
      }
    });
  }

  empty() {
    this.dialogSvc.show({content: '是否确定清空购物车！', confirm: '是的', cancel: '取消'}).subscribe(result => {
      if (result.value) {
        this.shoppingCartSvc.emptyCart().subscribe(res => {
          if (res.status.status === 0) {
            this.change.next(true);
          }
        });
      }
    });
  }

  bill(password) {
    const inputDto = {
      uidMember: this.member.uid,
      uidMemberCard: this.member.card.uidMemberCard,
      passWord: password
    };
    this.toastSvc.loading('兑换中...', 0);
    this.pointsSvc.bill(inputDto, this.shoppingCartSvc.currentCart).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.toastSvc.success('兑换成功');
        if (res.data.needPay) {
          this.change.next(true);
          this.zone.run(() => {
            this.router.navigate(['/checkout/index'],
              {queryParams: {uidShopCart: this.shoppingCartSvc.currentCart, businessType: 'SALE'}}).then();
          });
        } else {
          this.shoppingCartSvc.createEmptyCart().then(() => {
            this.change.next(true);
          });
        }
      }
    });
  }

  submit() {
    this.passwordSvc.show().subscribe(res => {
      if (res) {
        this.bill(res);
      }
    });
  }

}
