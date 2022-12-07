import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AppService} from '../../../../app.service';
import {AuthService} from '../../../auth/auth.service';
import {CheckAuth} from '../../../../@core/utils/check-auth';
import {PublicUtils} from '../../../../@core/utils/public-utils';

@Component({
  selector: 'app-vip-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class VipTabsComponent implements OnInit {
  @Output() refreshMemberEvent: EventEmitter<any> = new EventEmitter();
  @Output() askForUpdateMember: EventEmitter<any> = new EventEmitter();
  @Output() leavePage: EventEmitter<any> = new EventEmitter<any>();
  @Input() cardLength = 0;
  @Input() effectiveTicketCount = 0;
  index = 0;
  currentIndex = 0;
  authed = false;
  returned = false;
  cardType = 1;

  constructor(private modalController: ModalController,
              private appSvc: AppService, public authSvc: AuthService,
              private checkAuth: CheckAuth,
              private publicUtils: PublicUtils) {
  }

  ngOnInit() {
    this.cardType = this.publicUtils.getCardType();
    console.log(this.cardType);
  }

  selected() {
    return false;
  }

  askForRefresh(e) {
    this.refreshMemberEvent.emit();
  }

  /* 会员余额结转：'operBalTrans':2；会员充值冲销：'operRecharge':1 */
  indexChange(e) {
    if (e === 1 || e === 2) {
      if (!this.authed && !this.returned) {
        const authParams: any = {
          authFuctionName: '',
          authFuctionType: '1'
        };
        const code = e === 1 ? 'operRecharge' : 'operBalTrans';
        const fun = e === 1 ? 'recharge' : 'balTrans';
        authParams.authFuctionCode = code;
        authParams.uidAuthFuction = fun;

        this.checkAuth.auth(authParams, 'vip-tabs', (type, datas) => {
          if (type === -1) {
            this.returned = true;
            setTimeout(() => {
              this.index = this.currentIndex;
            });
          }
          if (type === 0) {
            this.index = e;
            this.currentIndex = this.index;
            this.authed = false;
            this.returned = false;
          }
          if (type === 1) {
            this.authed = true;
            this.index = e;
          }
        });

      } else {
        this.index = e;
        this.currentIndex = this.index;
        this.authed = false;
        this.returned = false;
      }
    } else {
      this.index = e;
      this.currentIndex = this.index;
      this.authed = false;
      this.returned = false;
    }
  }

  refreshTab(e) {
    if (e) {
      if (e.method === 'refreshMemberInfo') {
        console.log('收到刷新会员');
        this.refreshMemberEvent.emit();
      }
      if (e.toTabIndex) {
        console.log('toTabIndex', e.toTabIndex);
        this.index = e.toTabIndex;
      }
    }
  }

  emitLavePage(e) {
    this.leavePage.next(e);
  }
}
