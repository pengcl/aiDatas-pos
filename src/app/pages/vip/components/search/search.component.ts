import {Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastService} from '../../../../@theme/modules/toast';
import {PublicUtils} from '../../../../@core/utils/public-utils';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AppService} from '../../../../app.service';
import {VipService} from '../../vip.service';

@Component({
  selector: 'app-vip-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [NzMessageService]
})
export class VipSearchComponent implements OnInit, OnChanges {
  @Input() didEnter;
  @Input() disabled;
  @Output() conditonChangeEvent: EventEmitter<any> = new EventEmitter();
  form: FormGroup = new FormGroup({
    mobile: new FormControl('', []),
    cardNo: new FormControl('', []),
    selectType: new FormControl('1', []),
    other: new FormControl('', [])
  });
  nzSize = 'large';

  constructor(private route: ActivatedRoute,
              private message: NzMessageService,
              private publicUtils: PublicUtils,
              private toastSvc: ToastService,
              private appSvc: AppService,
              private vipService: VipService) {
    this.nzSize = document.body.offsetWidth > 1280 ? 'large' : 'normal';
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.didEnter && changes.didEnter.currentValue) {
      const no = this.route.snapshot.queryParams.cardNo;
      if (no) {
        this.form.get('cardNo').setValue(no);
        this.query();
      }
    }
    if (changes.disabled && typeof changes.disabled.currentValue === 'boolean') {
      changes.disabled.currentValue ? this.form.disable() : this.form.enable();
    }
  }


  // 会员卡
  readCard() {
    console.log('开始读卡');
    this.publicUtils.readCardSerialNum((res) => {
      console.log('读卡结果：', res);
      if (res.status === 0 || res.status === '0') {
        if (res.data && res.data !== '') {
          this.form.get('cardNo').setValue(res.data);
        }
      } else {
        this.message.error(res.msg);
      }
    });
  }

  // 会员查询条件，手机号，卡号，物理卡号
  // cardType 1-IC卡; 2-ID卡
  query() {
    const cardType = this.publicUtils.getCardType();
    if (cardType === 0) {
      this.message.warning('没有设置读卡器');
      return;
    }
    const formValue = this.form.value;
    const params: any = {};
    params.version = '2';
    params.bussinessType = '1';
    params.uidComp = this.appSvc.currentCinema.uidComp;
    params.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    params.memberMobile = formValue.mobile;
    params.cardNo = formValue.cardNo;
    params.cardType = cardType;
    if (formValue.selectType === '1') {
      params.memberIdCard = formValue.other;
    } else {
      params.memberAlias = formValue.other;
    }
    this.conditonChangeEvent.emit(params);
  }

  mobileFocus(isDisabled) {
    if (isDisabled) {
      return false;
    }
    this.form.get('cardNo').setValue('');
    this.form.get('other').setValue('');
  }

  cardNoFocus(isDisabled) {
    if (isDisabled) {
      return false;
    }
    this.form.get('mobile').setValue('');
    this.form.get('other').setValue('');
  }

  otherFocus(isDisabled) {
    if (isDisabled) {
      return false;
    }
    this.form.get('mobile').setValue('');
    this.form.get('cardNo').setValue('');
  }

  mobileEnter() {
    this.query();
  }

  cardNoEnter() {
    this.query();
  }

  otherEnter() {
    this.query();
  }

  resetCondition() {
    console.log('清空搜索信息');
    this.form.reset();
  }

}
