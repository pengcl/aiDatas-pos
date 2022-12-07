import {
  Directive,
  HostListener,
  Input,
  Output,
  ComponentRef, EventEmitter,
  OnDestroy
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Overlay,
  OverlayConfig
} from '@angular/cdk/overlay';
import { NzMessageService } from 'ng-zorro-antd';
import { HangUpComponent } from '../../entryComponents/hang-up/hang-up.component';
import { AppService } from '../../../../app.service';
import { ShoppingCartService, AddItemsInputDto } from '../../../shopping-cart/shopping-cart.service';
import { ProductService } from '../../product.service';
import { TicketService } from '../../../ticket/ticket.service';

@Directive({
  selector: '[appHangUp]',
  providers: [NzMessageService]
})

export class HangUpDirective {
  @Input() appHangUp;
  @Output() created: EventEmitter<any> = new EventEmitter();
  @Output() changeCart: EventEmitter<any> = new EventEmitter();
  @Output() deleted: EventEmitter<any> = new EventEmitter();

  compRef: ComponentRef<HangUpComponent>;
  subscribe;

  @HostListener('click', ['$event'])
  click(e) {
    if (this.appSvc.currentLoading) {
      return false;
    }
    const selected = this.ticketSvc.currentSelected;
    const seats = [];
    for (const uid in selected) {
      if (selected[uid]) {
        seats.push(uid);
      }
    }
    if (seats.length > 0) {
      this.message.warning('已有影票不能挂单！');
      return false;
    }
    this.hang(e);
  }

  constructor(private overlay: Overlay,
              private message: NzMessageService,
              private appSvc: AppService,
              private shoppingCartSvc: ShoppingCartService,
              private ticketSvc: TicketService,
              private productSvc: ProductService) {
  }

  open(e) {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.appHangUp.elementRef)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom'
        }
      ]);
    const config = new OverlayConfig();
    config.positionStrategy = positionStrategy;
    config.hasBackdrop = true; // 设置overlay后面有一层背景, 当然你也可以设置backdropClass 来设置这层背景的class
    const overlayRef = this.overlay.create(config); // OverlayRef, overlay层
    // overlayRef.addPanelClass('ion-page');
    overlayRef.backdropClick().subscribe(() => {
      // 点击了backdrop背景
      overlayRef.dispose();
    });
    // OverlayPanelComponent是动态组件
    // 创建一个ComponentPortal，attach到OverlayRef，这个时候我们这个overlay层就显示出来了。
    const portal: any = new ComponentPortal(HangUpComponent);
    this.compRef = overlayRef.attach(portal);
    this.subscribe = this.compRef.instance.created.subscribe(res => {
      this.created.next(true);
      overlayRef.dispose();
    });
    this.subscribe = this.compRef.instance.changeCart.subscribe(res => {
      this.changeCart.next(res);
      overlayRef.dispose();
    });

    this.subscribe = this.compRef.instance.deleted.subscribe(res => {
      this.deleted.next(res);
    });
  }

  hang(e) {
    const selected = this.productSvc.currentSelected;
    if (selected.length === 0) {
      this.open(e);
    } else {
      const inputDto: AddItemsInputDto = this.shoppingCartSvc.createAddProductInputDto(selected);
      this.appSvc.updateLoadingStatus(true);
      this.shoppingCartSvc.add(inputDto).subscribe(res => {
        this.appSvc.updateLoadingStatus(false);
        if (res.status.status === 0) {
          this.open(e);
        }
      });
    }
  }
}
