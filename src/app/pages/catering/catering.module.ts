import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {CateringRoutingModule} from './catering-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    CateringRoutingModule
  ],
  declarations: []
})
export class CateringPageModule {
}
