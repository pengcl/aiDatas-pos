import {Component, NgZone, ChangeDetectorRef} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {SettingService} from '../setting.service';
import {Router} from '@angular/router';
import {PublicUtils} from '../../../@core/utils/public-utils';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AppService} from '../../../app.service';
import {AuthService} from '../../auth/auth.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ToastService} from '../../../@theme/modules/toast';
import {StorageService} from '../../../@core/utils/storage.service';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from '../../../app.module';
import {timeout} from 'rxjs/operators';
import {HttpClient} from '../../../../../node_modules/@angular/common/http';

@Component({
  selector: 'app-setting-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
  providers: [NzMessageService, NzModalService]
})
export class SettingIndexPage {
  aidaShell = (window as any).aidaShell;
  form: FormGroup = new FormGroup({
    cardType: new FormControl('', [Validators.required]),
    cardReader: new FormControl('', [Validators.required]),
    printerMovieTicket: new FormControl('', [Validators.required]),
    printerMer: new FormControl('', [Validators.required]),
    printerCouTicket: new FormControl('', [Validators.required]),
    merSaleWare: new FormControl(''),
    terSaleScoTicket: new FormControl(false),
    terSaleScoMer: new FormControl(false),
    loginMemberSelected: new FormControl('0', [Validators.required]),
    autoSelectedTicketType: new FormControl('1', [Validators.required])
  });
  teminalParamList = [
    {keyCode: 'cardType', value: '', valueCode: '', valueName: ''},
    {keyCode: 'cardReader', value: '', valueCode: '', valueName: ''},
    {keyCode: 'printerMovieTicket', value: '', valueCode: '', valueName: ''},
    {keyCode: 'printerMer', value: '', valueCode: '', valueName: ''},
    {keyCode: 'printerCouTicket', value: '', valueCode: '', valueName: ''},
    {keyCode: 'merSaleWare', value: '', valueCode: '', valueName: ''},
    {keyCode: 'terSaleScoTicket', value: '0', valueCode: '', valueName: ''},
    {keyCode: 'terSaleScoMer', value: '0', valueCode: '', valueName: ''},
    {keyCode: 'loginMemberSelected', value: '0', valueCode: '', valueName: ''},
    {keyCode: 'autoSelectedTicketType', value: '1', valueCode: '', valueName: ''}
  ];
  cartTypeList;
  cardReaderList;
  printerList;
  printerList2;
  printerList3;
  cops;
  settngFlag = false;

  constructor(private zone: NgZone,
              private cdr: ChangeDetectorRef,
              private settingSvc: SettingService,
              private router: Router,
              private appSvc: AppService,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private publicUtils: PublicUtils,
              private storage: StorageService,
              private message: NzMessageService,
              private nzmodal: NzModalService,
              private http: HttpClient) {
  }

  ionViewDidEnter() {
    this.toastSvc.loading('正在处理...', 0);
    this.settingSvc.comps().subscribe(res => {
      console.log(res);
      this.toastSvc.hide();
      if (res.status.status === 0) {
        const arr = [];
        arr.push({
          uid: '',
          whName: '请选择仓库'
        });
        res.data.forEach(item => {
          arr.push(item);
        });
        this.cops = arr;
        this.zone.run(() => {
          this.queryTeminalDic();
        });
      } else {
        this.message.remove();
        this.message.error(res.status.msg2Client);
      }
    });
  }

  queryTeminalDic() {
    this.toastSvc.loading('正在处理...', 20000);
    this.settingSvc.dic().subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        let datas = [];
        if (res.data && res.data.length > 0) {
          datas = res.data;
        }
        if (datas.length > 0) {
          this.settngFlag = true;
          let existLoginMember = false;
          let existTicketType = false;
          const uidComp = this.appSvc.currentCinema.uidComp;
          const cinemaCode = this.appSvc.currentCinema.cinemaCode;
          const teminalCode = this.authSvc.currentTerminalCode;
          datas.forEach(item => {
            item.valueName = item.valueName.replace('智慧影擎', '');
            const key = item.keyCode;
            let value = item.valueCode;
            if (item.keyCode === 'terSaleScoTicket') {
              value = item.value === '1' ? true : false;
            } else if (item.keyCode === 'terSaleScoMer') {
              value = item.value === '1' ? true : false;
            } else if (item.keyCode === 'loginMemberSelected') {
              value = item.value;
              existLoginMember = true;
            } else if (item.keyCode === 'autoSelectedTicketType') {
              value = item.value;
              existTicketType = true;
            }
            item.uidComp = uidComp;
            item.cinemaCode = cinemaCode;
            item.teminalCode = teminalCode;
            this.form.get(item.keyCode).setValue(value);
          });
          if (!existLoginMember) {
            datas.push({keyCode: 'loginMemberSelected', value: '0', valueCode: '', valueName: '', uidComp, cinemaCode, teminalCode});
          }
          if (!existTicketType) {
            datas.push({keyCode: 'autoSelectedTicketType', value: '1', valueCode: '', valueName: '', uidComp, cinemaCode, teminalCode});
          }
          this.teminalParamList = datas;
        }
      }
      this.getCardReaderList();
      this.getCardTypeList();
      this.getPrinterList();
    });
  }

  getCardReaderList() {
    this.publicUtils.getCardReaderList('getCardTypeCallback', (res) => {
      if (res.status === 0) {
        const rres = JSON.parse(res.data);
        if (rres && rres.length > 0){
          rres.forEach(item => {
            item.CardReaderName = item.CardReaderName.replace('智慧影擎', '');
          });
        }
        this.cardReaderList = rres;
      } else {
        this.teminalParamList.forEach(item => {
          if (item.keyCode === 'cardReader') {
            item.valueName = item.valueName.replace('智慧影擎', '');
            this.cardReaderList = [{CardReaderCode: item.valueCode, CardReaderName: item.valueName}];
          }
        });
        this.message.remove();
        this.message.error(res.msg);
      }
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  getPrinterList() {
    this.publicUtils.getPrinterList('getCardTypeCallback', (res) => {
      // 模拟数据
      if (res.status === 0) {
        const rres = JSON.parse(res.data);
        if (rres && rres.length > 0){
          rres.forEach(item => {
            item.PrinterName = item.PrinterName.replace('智慧影擎', '');
          });
        }
        this.printerList = rres;
        this.printerList2 = rres;
        this.printerList3 = rres;
      } else {
        this.teminalParamList.forEach(item => {
          item.valueName = item.valueName.replace('智慧影擎', '');
          if (item.keyCode === 'printerMovieTicket') {
            this.printerList = [{PrinterCode: item.valueCode, PrinterName: item.valueName}];
          } else if (item.keyCode === 'printerMer') {
            this.printerList2 = [{PrinterCode: item.valueCode, PrinterName: item.valueName}];
          } else if (item.keyCode === 'printerCouTicket') {
            this.printerList3 = [{PrinterCode: item.valueCode, PrinterName: item.valueName}];
          }
        });
        this.message.remove();
        this.message.error(res.msg);
      }
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  getCardTypeList() {
    this.publicUtils.getCardTypeList('getCardTypeCallback', (res) => {
      if (res.status === 0) {
        const rres = JSON.parse(res.data);
        if (rres && rres.length > 0){
          rres.forEach(item => {
            item.CardTypeName = item.CardTypeName.replace('智慧影擎', '');
          });
        }
        this.cartTypeList = rres;
      } else {
        this.teminalParamList.forEach(item => {
          if (item.keyCode === 'cardType') {
            item.valueName = item.valueName.replace('智慧影擎', '');
            this.cartTypeList = [{CardTypeCode: item.valueCode, CardTypeName: item.valueName}];
          }
        });
        this.message.remove();
        this.message.error(res.msg);
      }
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  commit() {
    if (!this.form.valid) {
      this.message.warning('请选择下拉框信息');
      return;
    }
    const terSaleScoTicket = this.form.get('terSaleScoTicket').value;
    const terSaleScoMer = this.form.get('terSaleScoMer').value;
    const merSaleWare = this.form.get('merSaleWare').value;
    if (!terSaleScoTicket && !terSaleScoMer) {
      this.message.warning('请勾选零售终端售卖范围');
      return;
    }
    if (terSaleScoMer && !merSaleWare) {
      this.message.warning('请选择卖品销售出库关联仓库');
      return;
    }
    this.teminalParamList.forEach(item => {
      const value = this.form.get(item.keyCode).value;
      if (item.keyCode === 'terSaleScoTicket' || item.keyCode === 'terSaleScoMer') {
        item.value = value ? '1' : '0';
        item.valueCode = '';
      } else {
        item.value = value;
        item.valueCode = value;
      }
      item.valueName = '';
      this.getSelectName(item);
    });
    console.log(this.teminalParamList);
    const params = {
      uidComp: this.appSvc.currentCinema.uidComp,
      cinemaCode: this.appSvc.currentCinema.cinemaCode,
      teminalCode: this.authSvc.currentTerminalCode,
      teminalParamList: this.teminalParamList
    };
    this.toastSvc.loading('正在处理...', 20000);
    this.settingSvc.save(params).subscribe(res => {
      this.toastSvc.hide();
      if (res.status.status === 0) {
        this.settngFlag = true;
        this.appSvc.updateSettingStatus(this.teminalParamList);
        this.nzmodal.confirm({
          nzTitle: '保存成功，请退出系统重新登录以启用最新设置。',
          nzContent: '',
          nzOkText: '确定',
          nzOkType: 'primary',
          // nzOkDanger: true,
          nzOnOk: () => {
            this.authSvc.logout({}).subscribe(rs => {
              if (rs.status.status === 0) {
                this.storage.clear();
                try {
                  this.aidaShell.saveDataToCache('', 'token', '');
                } catch (e) {
                  console.log(e.message);
                }
                this.zone.run(() => {
                  this.router.navigate(['/auth']).then();
                });
              } else {
                this.message.remove();
                this.message.error(rs.status.msg2Client);
              }
            });
          },
          nzCancelText: '取消',
          nzOnCancel: () => {
            // this.router.navigate(['/ticket/index']).then();
          }
        });
      } else {
        this.message.error(res.status.msg2Client);
      }
    });
  }

  getSelectName(item) {
    if (item.keyCode === 'cardType') {
      this.cartTypeList.forEach(it => {
        if (it.CardTypeCode === item.valueCode) {
          item.valueName = it.CardTypeName;
        }
      });
    } else if (item.keyCode === 'cardReader') {
      this.cardReaderList.forEach(it => {
        if (it.CardReaderCode === item.valueCode) {
          item.valueName = it.CardReaderName;
        }
      });
    } else if (item.keyCode === 'printerMovieTicket' || item.keyCode === 'printerMer' || item.keyCode === 'printerCouTicket') {
      let arr = [];
      if (item.keyCode === 'printerMovieTicket') {
        arr = this.printerList;
      } else if (item.keyCode === 'printerMer') {
        arr = this.printerList2;
      } else if (item.keyCode === 'printerCouTicket') {
        arr = this.printerList3;
      }
      arr.forEach(it => {
        if (it.PrinterCode === item.valueCode) {
          item.valueName = it.PrinterName;
        }
      });
    } else if (item.keyCode === 'merSaleWare') {
      this.cops.forEach(it => {
        if (it.uid === item.valueCode) {
          item.valueName = it.whName;
        }
      });
    }
  }

  close() {
    if (!this.settngFlag) {
      this.message.warning('请先设置系统参数');
      return;
    }
    this.zone.run(() => {
      const url = this.appSvc.currentDefaultUrl;
      this.router.navigate([url]).then();
    });
  }

  dblclickF(){
    const url = this.appSvc.currentCinema.codeUrl + encodeURIComponent('0021211018224653000000000000000400110331202100212021101800142021-10-18T21:40:0000000401_##8_##9040.00000.00');
    console.log('获取影院影票信息码地址-->' + url);
    this.toastSvc.loading('检测中，稍等...', 0);
    this.http.get(url, {responseType: 'text'})
      .pipe(timeout(5000))
      .subscribe(
        res => {
          this.toastSvc.hide();
          console.log('获取影院影票信息码地址,返回结果--> ' + res);
          res = decodeURIComponent(res);
          alert(res);
        },
        error => {
          this.toastSvc.hide();
          alert('失败:(' + error.message + ')');
        });
  }
}
