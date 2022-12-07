import {AfterViewInit, NgZone, Component, ElementRef, ViewChild} from '@angular/core';
import {LocationStrategy} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../app.service';
import {CheckTicketService} from '../checkticket.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastService} from '../../../@theme/modules/toast';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-checkticket-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService]
})
export class CheckTicketIndexPage implements AfterViewInit {

  form: FormGroup = new FormGroup({
    ticketCode: new FormControl('', [Validators.required])
  });
  @ViewChild('autoFocusInput', {static: false}) private autoFocusInput: ElementRef;
  detail;

  constructor(private zone: NgZone,
              private location: LocationStrategy,
              private modalController: ModalController,
              private appSvc: AppService,
              private checkTicketSvc: CheckTicketService,
              private router: Router,
              private toastSvc: ToastService,
              private message: NzMessageService) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.autoFocusInput.nativeElement.focus();
    }, 500);
  }

  // 键盘事件
  pressQuery(event) {
    if (event && event.keyCode === 13) {
      this.query();
    }
  }

  clear() {
    this.form.get('ticketCode').setValue('');
    this.detail = null;
    setTimeout(() => {
      this.autoFocusInput.nativeElement.focus();
    }, 500);
  }

  // 查询
  query() {
    if (this.form.invalid) {
      if (!this.form.get('ticketCode').value) {
        this.message.warning('请输入电影票编号');
      }
      return;
    }
    const params = {
      ticketCode: this.form.get('ticketCode').value,
      cinemaCode: this.appSvc.currentCinema.cinemaCode
    };
    this.detail = null;
    this.toastSvc.loading('正在处理...', 20000);
    this.checkTicketSvc.posCheckVerify(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        if (res.data.isTicketExists === 0) {
          this.message.info('查询不到该电影票信息，请重新输入。');
        } else {
          this.detail = res.data;
          this.detail.seatColRow = this.detail.seatRow + '排' + this.detail.seatCol + '号';
          if (this.detail.isPrint === 0) {
            this.detail.isPrintName = '未打印';
          } else if (this.detail.isPrint === 1) {
            this.detail.isPrintName = '已打印';
          }
        }
      }
    });
  }

  changeNumber(target, e) {
    this.form.get(target).setValue(e);
  }

  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then(() => {
        this.clear();
      });
    });
  }
}
