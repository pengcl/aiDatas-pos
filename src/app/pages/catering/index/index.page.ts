import {Component, NgZone, ChangeDetectorRef} from '@angular/core';
import {SnackbarService} from '../../../@core/utils/snackbar.service';
import {CateringService} from '../catering.service';
import {mergeParams} from '../../../@core/utils/extend';
import {Router} from '@angular/router';
import {VoucherPrinter} from '../../../@core/utils/voucher-printer';
import {ToastService} from '../../../@theme/modules/toast';
import {AppService} from '../../../app.service';

@Component({
  selector: 'app-catering-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss']
})
export class CateringIndexPage {
  page = {
    currentPage: 1,
    pageSize: 10
  };
  type: '1' | '2' = '1';
  params = {
    takeNum: '',
    queryType: this.type
  };
  detail;
  data;

  constructor(private zone: NgZone,
              private cdr: ChangeDetectorRef,
              private snackbar: SnackbarService,
              private voucherPrinter: VoucherPrinter,
              private toastSvc: ToastService,
              private cateringSvc: CateringService,
              private router: Router,
              private appSvc: AppService) {
  }

  getData() {
    const inputDto = mergeParams([this.page, this.params]);
    console.log(this.page);
    if (this.type === '2') {
      inputDto.page = this.page;
    }
    this.cateringSvc.items(inputDto).subscribe(res => {
      this.data = res.data.detail;
      if (this.type === '2') {
        this.page = res.data.page;
      }
    });
  }

  ionViewDidEnter() {
    this.getData();
  }

  search(params) {
    this.page.currentPage = 1;
    this.params = params;
    this.getData();
  }

  typeChange(e) {
    this.type = e;
    this.page.currentPage = 1;
    this.getData();
  }

  done(item) {
    if (item) {
      this.cateringSvc.done(item.uidBill).subscribe(res => {
        this.getData();
      });
    }
  }

  finished(item) {
    if (item) {
      this.cateringSvc.finished(item.uidBill).subscribe(res => {
        this.getData();
      });
    }
  }

  pageChange(e) {
    this.getData();
  }

  back() {
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }

  print(e) {
    this.toastSvc.loading('打印中...', 0);
    const body = {
      typeCode: 'T00211',
      uidBill: e.uidBill,
      uidComp: this.appSvc.currentCinema.uidComp
    };
    this.voucherPrinter.print(body, '', (res) => {
      this.toastSvc.hide();
      if (res.sutatus !== '0') {
        this.snackbar.show(res.msg, 3000);
      }
    });
  }
}
