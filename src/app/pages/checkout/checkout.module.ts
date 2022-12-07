import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../@theme/theme.module';
import {CheckoutRoutingModule} from './checkout-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    CheckoutRoutingModule
  ],
  declarations: [],
  entryComponents: []
})
export class CheckoutPageModule {
}
