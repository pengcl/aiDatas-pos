import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {VipIndexPage} from './index.page';
import {VipInfoComponent} from '../components/info/info.component';
import {VipSearchComponent} from '../components/search/search.component';
import {VipTabsComponent} from '../components/tabs/tabs.component';
import {VipTabsTradeComponent} from '../components/tabs/components/trade/trade.component';
import {VipTabsPointsComponent} from '../components/tabs/components/points/points.component';
import {VipTabsRechargeComponent} from '../components/tabs/components/recharge/recharge.component';
import {VipTabsCouponComponent} from '../components/tabs/components/coupon/coupon.component';
import {VipTabsCardsComponent} from '../components/tabs/components/cards/cards.component';
import {VipTabsWriteOffComponent} from '../components/tabs/components/write-off/write-off.component';
import {VipTabsCarryForwardComponent} from '../components/tabs/components/carry-forward/carry-forward.component';
import {VipEditComponent} from '../entryComponents/edit/edit.component';
import {ResetPasswordComponent} from '../../../@theme/entryComponents/reset/reset.component';
import {VipUpdateComponent} from '../entryComponents/update/update.component';
import {VipTabsReplacementComponent} from '../components/tabs/components/replacement/replacement.component';
import {VipTabsRenewalComponent} from '../components/tabs/components/renewal/renewal.component';
import {VipTabsUpgradeComponent} from '../components/tabs/components/upgrade/upgrade.component';
import {VipTabsResetComponent} from '../components/tabs/components/reset/reset.component';
import {VipTabsRebindComponent} from '../components/tabs/components/rebind/rebind.component';
import {VipTabsFrozenComponent} from '../components/tabs/components/frozen/frozen.component';
import {VipTabsCancelComponent} from '../components/tabs/components/cancel/cancel.component';
import {VipCardComponent} from '../entryComponents/card/card';
import {VipCouponsComponent} from '../entryComponents/coupons/coupons';
import {VipCouponsV2Component} from '../entryComponents/couponsV2/couponsV2';
import {VipTabsOperatesComponent} from '../components/tabs/components/operates/operates.component';
import {VipGiveComponent} from '../entryComponents/give/give';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: VipIndexPage}])
  ],
  declarations: [
    VipIndexPage,
    VipInfoComponent,
    VipSearchComponent,
    VipTabsComponent,
    VipTabsTradeComponent,
    VipTabsPointsComponent,
    VipTabsRechargeComponent,
    VipTabsCouponComponent,
    VipTabsCardsComponent,
    VipTabsWriteOffComponent,
    VipTabsCarryForwardComponent,
    VipEditComponent,
    ResetPasswordComponent,
    VipUpdateComponent,
    VipCardComponent,
    VipTabsReplacementComponent,
    VipTabsRenewalComponent,
    VipTabsUpgradeComponent,
    VipTabsResetComponent,
    VipTabsRebindComponent,
    VipTabsFrozenComponent,
    VipTabsCancelComponent,
    VipCouponsComponent,
    VipTabsOperatesComponent,
    VipGiveComponent,
    VipCouponsV2Component
  ],
  entryComponents: [VipEditComponent, ResetPasswordComponent, VipUpdateComponent, VipCardComponent, VipCouponsV2Component],
  providers: []
})
export class VipIndexPageModule {
}
