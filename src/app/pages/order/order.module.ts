import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {OrderRoutingModule} from './order-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    OrderRoutingModule
  ],
  declarations: []
})
export class OrderPageModule {
}
