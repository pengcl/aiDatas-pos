import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {CheckoutIndexPage} from './index.page';
import {CheckoutActivitiesPage} from '../components/activities/activities.page';
import {CheckoutCartPage} from '../components/cart/cart.page';
import {CheckoutCheckPage} from '../components/check/check.page';
import {CheckoutCheck2Page} from '../components/check2/check.page';
import {CheckoutCashComponent} from '../entryComponents/cash/cash.component';
import {CheckoutMemberCardPayComponent} from '../entryComponents/memberCard/pay/memberCardPay.component';
import {CheckoutMemberCardRechargeComponent} from '../entryComponents/memberCard/recharge/recharge.component';
import {CheckoutMemberCardCardComponent} from '../entryComponents/memberCard/card/card.component';
import {CheckoutUseCouponComponent} from '../entryComponents/useCoupon/useCoupon.component';
import {CheckoutUseGroupCouponComponent} from '../entryComponents/useGroupCoupon/useGroupCoupon.component';
import {CheckoutUseMemberCouponComponent} from '../entryComponents/useMemberCoupon/useMemberCoupon.component';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: CheckoutIndexPage}])
  ],
  declarations: [
    CheckoutIndexPage,
    CheckoutCartPage,
    CheckoutCheckPage,
    CheckoutCheck2Page,
    CheckoutActivitiesPage,
    CheckoutCashComponent,
    CheckoutMemberCardPayComponent,
    CheckoutMemberCardRechargeComponent,
    CheckoutMemberCardCardComponent,
    CheckoutUseCouponComponent,
    CheckoutUseGroupCouponComponent,
    CheckoutUseMemberCouponComponent,
  ],
  entryComponents: [
    CheckoutCashComponent,
    CheckoutMemberCardPayComponent,
    CheckoutMemberCardRechargeComponent,
    CheckoutMemberCardCardComponent,
    CheckoutUseCouponComponent,
    CheckoutUseGroupCouponComponent,
    CheckoutUseMemberCouponComponent,
  ]
})
export class CheckoutIndexPageModule {
}
