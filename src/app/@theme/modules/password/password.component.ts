import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  Output, ViewChild,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Observable, Observer, Subscription} from 'rxjs';

import {NzMessageService} from 'ng-zorro-antd';
import {MemberService} from '../member/member.service';

@Component({
  selector: 'app-password',
  exportAs: 'appPassword',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.less'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
  providers: [NzMessageService]
})
export class PasswordComponent implements AfterViewInit, OnDestroy {
  private observer: Observer<any>;
  shown = false;
  data: any;
  /**
   * 打开动画结束后回调（唯一参数：密码框实例对象）
   */
  @Output() readonly open = new EventEmitter<PasswordComponent>();

  /**
   * 关闭动画开始时回调（唯一参数：密码框实例对象）
   */
  @Output() readonly close = new EventEmitter<PasswordComponent>();
  form: FormGroup = new FormGroup({
    0: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    1: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    2: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    3: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    4: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    5: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)])
  });
  @ViewChild('container', {static: true}) container: any;
  title = '请输入六位会员密码';
  isVerify = false;
  uid;
  error = '';

  constructor(private cdr: ChangeDetectorRef,
              private message: NzMessageService,
              private memberSvc: MemberService) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setFocus(0);
    }, 100);
  }

  del(target) {
    console.log(target);
    this.setPrevFocus(target);
  }

  private setFocus(target) {
    const containerEl = this.container.nativeElement;
    let firstFormEl: any = null;
    firstFormEl = containerEl.querySelectorAll('input')[target];
    if (firstFormEl) {
      firstFormEl.focus();
    }
  }

  inputChange(target, e) {
    if (this.form.get(target + '').valid) {
      this.setNextFocus(target);
    }
  }

  setPrevFocus(target) {
    if (target > 0) {
      this.setFocus(target - 1);
    }
  }

  setNextFocus(target) {
    if (target < 5) {
      this.setFocus(target + 1);
    } else {
      setTimeout(() => {
        if (this.form.valid) {
          this.complete();
        }
      }, 100);
    }
  }

  /**
   * 显示，组件载入页面后并不会显示，显示调用 `show()` 并订阅结果。
   */
  show(): Observable<any> {
    this.shown = true;
    // this._prompError = false;
    this.cdr.detectChanges();
    // 模拟动画结束后回调
    setTimeout(() => {
      this.open.emit(this);
    }, 300);
    return new Observable((observer: Observer<any>) => {
      this.observer = observer;
    });
  }

  /**
   * 隐藏
   *
   * @param is_backdrop 是否从背景上点击
   */
  hide(isBackdrop: boolean = false) {
    if (isBackdrop === true) {
      return false;
    }

    this.shown = false;
    this.cdr.detectChanges();
    this.close.emit(this);
  }

  getPassword() {
    let password = '';
    // tslint:disable-next-line:forin
    for (const key in this.form.value) {
      password = password + this.form.get(key).value;
    }
    return password;
  }

  verifyPassword() {
    const memberPassword = this.getPassword();
    this.memberSvc.verifyPassword({memberPassword, uid: this.uid}).subscribe(res => {
      if (res.data) {
        this.observer.next({
          memberId: res.data.memberId,
          uid: res.data.uid,
          password: memberPassword,
          member: res.data
        });
        this.observer.complete();
        this.hide();
        return false;
      } else {
        this.form.reset();
        this.setFocus(0);
        this.error = '会员密码错误，请重新输入';
      }
    });
  }

  complete() {
    if (this.isVerify) {
      this.verifyPassword();
    } else {
      this.observer.next(this.getPassword());
      this.observer.complete();
      this.hide();
      return false;
    }
  }

  cancel() {
    this.observer.next(null);
    this.observer.complete();
    this.hide();
    return false;
  }

  ngOnDestroy(): void {
    if (this.observer && this.observer instanceof Subscription) {
      (this.observer as Subscription).unsubscribe();
    }
  }
}
