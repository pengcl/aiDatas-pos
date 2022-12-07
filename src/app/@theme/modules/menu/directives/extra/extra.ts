import {
  Directive,
  HostListener,
  Input,
  Output,
  ComponentRef, EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {Router} from '@angular/router';
import {ComponentPortal} from '@angular/cdk/portal';
import {
  Overlay,
  OverlayConfig
} from '@angular/cdk/overlay';
import {MenuExtraComponent} from '../../components/extra/extra';
import {filter} from 'rxjs/operators';
import {NavigationEnd} from '@angular/router';

@Directive({
  selector: '[appExtraMenus]',
  providers: []
})

export class MenuExtraDirective implements OnChanges {
  @Input() appExtraMenus;
  @Input() extraMenus;

  compRef: ComponentRef<MenuExtraComponent>;
  overlayRef;

  @HostListener('click', ['$event'])
  click(e) {
    const positionStrategy = this.overlay.position()
    .flexibleConnectedTo(this.appExtraMenus.elementRef)
    .withPositions([
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
      }
    ]);
    const config = new OverlayConfig();
    config.positionStrategy = positionStrategy;
    config.hasBackdrop = true; // 设置overlay后面有一层背景, 当然你也可以设置backdropClass 来设置这层背景的class
    this.overlayRef = this.overlay.create(config); // OverlayRef, overlay层
    this.overlayRef.backdropClick().subscribe(() => {
      // 点击了backdrop背景
      this.overlayRef.dispose();
    });
    // OverlayPanelComponent是动态组件
    // 创建一个ComponentPortal，attach到OverlayRef，这个时候我们这个overlay层就显示出来了。
    const portal: any = new ComponentPortal(MenuExtraComponent);
    this.compRef = this.overlayRef.attach(portal);
    this.compRef.instance.items = this.extraMenus;
    this.compRef.instance.done.subscribe(() => {
      this.overlayRef.dispose();
    });
  }

  constructor(private router: Router, private overlay: Overlay) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(data => {
      if (this.overlayRef) {
        this.overlayRef.dispose();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    /*if (changes.value.currentValue !== changes.value.previousValue) {
      this.value = changes.value.currentValue;
      if (this.compRef) {
        this.compRef.instance.value = this.value;
      }
    }*/
  }
}
