import {
  Component,
  ChangeDetectorRef,
  OnDestroy, Input, Output, EventEmitter,
  OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SnackbarService } from '../../../../../@core/utils/snackbar.service';
import { TicketService } from '../../../ticket.service';
import { AppService } from '../../../../../app.service';
import { ShoppingCartService } from '../../../../shopping-cart/shopping-cart.service';
import { DatePipe } from '@angular/common';
import { checkRedirect } from '../../../../../@core/utils/extend';
import { TicketPlansFullComponent } from './full/plans-full.component';
import { SubService } from '../../../../sub/sub.service';

@Component({
  selector: 'app-ticket-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
  providers: [DatePipe]
})
export class TicketPlansComponent implements OnInit, OnDestroy {
  @Output() askForReload: EventEmitter<any> = new EventEmitter();
  @Input() loading;
  type;
  plans;
  form: FormGroup = new FormGroup({
    date: new FormControl(new Date(), [Validators.required])
  });
  subscribe: any = {};

  constructor(private route: ActivatedRoute,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              private modalController: ModalController,
              private snackbarSvc: SnackbarService,
              private datePipe: DatePipe,
              private appSvc: AppService,
              private ticketSvc: TicketService,
              private subSvc: SubService,
              private shoppingCartSvc: ShoppingCartService) {
  }


  ngOnInit() {
    this.type = 'film';
    this.subscribe.getPlansStatus = this.ticketSvc.getPlansStatus().subscribe(res => {
      this.plans = res;
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    });
    this.subscribe.getDateStatus = this.ticketSvc.getDateStatus().subscribe(res => {
      if (res) {
        this.form.get('date').setValue(res);
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  prev() {
    const timeStamp = new Date(this.form.get('date').value).getTime() - 24 * 60 * 60 * 1000;
    this.changeDate(timeStamp);
  }

  segmentChange(e) {
    this.type = e.detail.value;
    this.subSvc.updateSub('type', this.type);
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
  }

  next() {
    const timeStamp = new Date(this.form.get('date').value).getTime() + 24 * 60 * 60 * 1000;
    this.changeDate(timeStamp);
  }

  changeDate(timeStamp) {
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.error.seats) {
        this.snackbarSvc.show('您已经选择了座位，无法切换排期', 2000);
      } else {
        this.form.get('date').setValue(this.datePipe.transform(new Date(timeStamp), 'yyyy-MM-dd'));
        this.ticketSvc.updateDateStatus(this.form.get('date').value);
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  dateChange(e) {
    const timeStamp = new Date(e.value).getTime();
    this.changeDate(timeStamp);
  }

  /*full-modal*/
  async presentFullModal(type) {
    const modal = await this.modalController.create({
      showBackdrop: true,
      backdropDismiss: false,
      component: TicketPlansFullComponent,
      cssClass: 'full-modal',
      componentProps: {type, date: this.form.get('date').value}
    });
    await modal.present();
    this.subSvc.updateSub('open', true);
    const {data} = await modal.onDidDismiss(); // 获取关闭传回的值
    this.subSvc.updateSub('open', false);
    if (data) {
      this.type = data;
    }
  }

  reload() {
    // this.getData();
    checkRedirect(this.shoppingCartSvc).then(res => {
      if (res.error.seats) {
        this.snackbarSvc.show('您已经选择了座位，无法切换排期', 2000);
      } else {
        this.askForReload.next(true);
      }
    });
  }

  ngOnDestroy() {
    for (const key in this.subscribe) {
      if (this.subscribe[key]) {
        this.subscribe[key].unsubscribe();
      }
    }
  }

}
