import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {CouponRoutingModule} from './coupon-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    CouponRoutingModule
  ],
  declarations: []
})
export class CouponPageModule {
}
