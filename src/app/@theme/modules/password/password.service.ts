import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { BaseService } from '../../../@core/utils/base.service';
import { Observable } from 'rxjs';
import { PasswordComponent } from './password.component';

@Injectable({providedIn: 'root'})
export class PasswordService extends BaseService {
  constructor(
    resolver: ComponentFactoryResolver,
    applicationRef: ApplicationRef,
    injector: Injector,
    @Inject(DOCUMENT) doc: any
  ) {
    super(resolver, applicationRef, injector, doc);
  }

  /**
   * 关闭最新dialog
   */
  hide() {
    this.destroy();
  }

  /**
   * 创建一个对话框并显示
   *
   * @param data 对话框配置项
   * @returns 可订阅来获取结果
   */
  show(title?, isVerify?, uid?): Observable<any> {
    const componentRef = this.build(PasswordComponent);
    if (title) {
      componentRef.instance.title = title;
    }
    if (isVerify) {
      componentRef.instance.isVerify = isVerify;
      componentRef.instance.uid = uid;
    }
    componentRef.instance.close.subscribe(() => {
      setTimeout(() => this.destroy(componentRef), 300);
    });
    return componentRef.instance.show();
  }
}
