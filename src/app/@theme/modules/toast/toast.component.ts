import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {ToastConfig} from './toast.config';

@Component({
  selector: 'weui-toast',
  exportAs: 'weuiToast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[hidden]': '!show',
  },
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
})
export class ToastComponent implements OnDestroy {
  /**
   * 类型
   */
  @Input()
  set type(type: 'success' | 'loading') {
    Object.assign(this, this.DEF[type]);
  }

  /**
   * 文本
   */
  @Input() text: string;
  /**
   * icon图标Class名
   */
  @Input() icon: string;
  /**
   * 显示时长后自动关闭（单位：ms），0 表示永久，默认：`2000`
   */
  @Input() time = 2000;
  /**
   * 隐藏后回调
   */
  @Output() readonly hide = new EventEmitter();

  constructor(private DEF: ToastConfig) {
    this.type = 'success';
  }

  show = false;
  private timer: any;

  onShow() {
    this.show = true;
    if (this.time > 0) {
      this.timer = setTimeout(() => {
        this.onHide();
      }, this.time);
    }
    return this;
  }

  onHide() {
    this.show = false;
    this.hide.emit();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
