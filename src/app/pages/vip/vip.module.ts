import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {VipRoutingModule} from './vip-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    VipRoutingModule
  ],
  exports: [
  ],
  declarations: []
})
export class VipPageModule {
}
