import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {ProductRoutingModule} from './product-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    ProductRoutingModule
  ],
  declarations: []
})
export class ProductPageModule {
}
