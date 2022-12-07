import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {CouponIndexPage} from './index.page';
import {CouponCartComponent} from '../components/cart/cart.component';
import {CouponTicketComponent} from '../components/ticket/ticket.component';
import {CouponAddComponent} from '../entryComponents/add/add.component';
import {AmountPipe, CouponDescriptionPipe} from '../coupon.pipe';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: CouponIndexPage}])
  ],
  declarations: [
    CouponIndexPage,
    CouponCartComponent,
    CouponTicketComponent,
    CouponAddComponent,
    AmountPipe,
    CouponDescriptionPipe
  ],
  entryComponents: [CouponAddComponent],
  providers: [AmountPipe, CouponDescriptionPipe]
})
export class CouponIndexPageModule {
}
