import {
  Directive,
  HostListener,
  Input,
  Output,
  ComponentRef, EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Overlay,
  OverlayConfig
} from '@angular/cdk/overlay';
import { KeyboardNumberComponent } from '../../components/keyboard/number/number';

@Directive({
  selector: '[appKeyboardNumber]',
  providers: []
})

export class KeyboardNumberDirective implements OnChanges {
  @Input() appKeyboardNumber;
  @Input() value;
  @Input() dotDisabled = false;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  compRef: ComponentRef<KeyboardNumberComponent>;
  overlayRef;
  @Output() overlays: EventEmitter<any> = new EventEmitter();
  subscribe;

  /*@HostListener('blur', ['$event'])
  blur(e) {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.close.next(true);
    }
  }*/

  @HostListener('focus', ['$event'])
  focus(e) {
    if (e.target.readOnly || !e.sourceCapabilities) {
      return false;
    }
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.appKeyboardNumber.elementRef)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }
      ]);
    const config = new OverlayConfig();
    config.positionStrategy = positionStrategy;
    config.hasBackdrop = true; // 设置overlay后面有一层背景, 当然你也可以设置backdropClass 来设置这层背景的class
    this.overlayRef = this.overlay.create(config); // OverlayRef, overlay层
    this.overlays.next(this.overlayRef);
    this.overlayRef.addPanelClass('keyboard-number-panel');
    this.overlayRef.backdropClick().subscribe((res) => {
      // 点击了backdrop背景
      res.target.blur();
      this.overlayRef.dispose();
      this.close.next(true);
    });
    this.overlayRef.keydownEvents().subscribe(res => {
      if (res.key === 'Enter') {
        res.target.blur();
        this.overlayRef.dispose();
        this.close.next(true);
      }
    });
    // OverlayPanelComponent是动态组件
    // 创建一个ComponentPortal，attach到OverlayRef，这个时候我们这个overlay层就显示出来了。
    const portal: any = new ComponentPortal(KeyboardNumberComponent);
    this.compRef = this.overlayRef.attach(portal);
    this.compRef.instance.value = this.value;
    this.compRef.instance.dotDisabled = this.dotDisabled;
    this.subscribe = this.compRef.instance.valueChange.subscribe(res => {
      this.value = res;
      this.valueChange.next(this.value);
    });
  }

  constructor(private overlay: Overlay) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (changes.value && changes.value.currentValue !== changes.value.previousValue) {
      this.value = changes.value.currentValue;
      if (this.compRef) {
        this.compRef.instance.value = this.value;
      }
    }
  }
}
