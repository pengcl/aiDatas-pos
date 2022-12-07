import {
  Directive,
  HostListener,
  Input,
  Output,
  ComponentRef, EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {ComponentPortal} from '@angular/cdk/portal';
import {
  Overlay,
  OverlayConfig
} from '@angular/cdk/overlay';
import {KeyboardComponent} from '../../components/keyboard/keyboard';

@Directive({
  selector: '[appKeyboard]',
  providers: []
})

export class KeyboardDirective implements OnChanges {
  @Input() appKeyboard;
  @Input() value;
  @Input() prev;
  @Input() next;
  @Input() dotDisabled = false;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() keyChange: EventEmitter<any> = new EventEmitter();

  compRef: ComponentRef<KeyboardComponent>;
  subscribe;
  keySubscribe;
  @HostListener('enter', ['$event'])
  enter(e) {
    console.log(e);
  }

  @HostListener('click', ['$event'])
  click(e) {
    console.log('click');
    const positionStrategy = this.overlay.position()
    .global() // 全局显示
    .centerHorizontally().bottom('50px');
    const config = new OverlayConfig();
    config.positionStrategy = positionStrategy;
    config.hasBackdrop = true; // 设置overlay后面有一层背景, 当然你也可以设置backdropClass 来设置这层背景的class
    const overlayRef = this.overlay.create(config); // OverlayRef, overlay层
    overlayRef.addPanelClass('keyboard-panel');
    overlayRef.backdropClick().subscribe(() => {
      // 点击了backdrop背景
      overlayRef.dispose();
      this.close.next(true);
    });
    overlayRef.keydownEvents().subscribe(res => {
      if (res.key === 'Enter') {
        overlayRef.dispose();
        this.close.next(true);
      }
    });
    // OverlayPanelComponent是动态组件
    // 创建一个ComponentPortal，attach到OverlayRef，这个时候我们这个overlay层就显示出来了。
    const portal: any = new ComponentPortal(KeyboardComponent);
    this.compRef = overlayRef.attach(portal);
    this.compRef.instance.prev = this.prev;
    this.compRef.instance.next = this.next;
    this.compRef.instance.value = this.value;
    this.compRef.instance.dotDisabled = this.dotDisabled;
    this.subscribe = this.compRef.instance.valueChange.subscribe(res => {
      this.value = res;
      this.valueChange.next(this.value);
    });
    this.keySubscribe = this.compRef.instance.keyChange.subscribe(res => {
      overlayRef.dispose();
      this.close.next(true);
      this.keyChange.next(res);
    });
  }

  constructor(private overlay: Overlay) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value.currentValue !== changes.value.previousValue) {
      this.value = changes.value.currentValue;
      if (this.compRef) {
        this.compRef.instance.value = this.value;
      }
    }
  }
}
