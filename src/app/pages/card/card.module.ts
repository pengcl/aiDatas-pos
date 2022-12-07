import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {CardRoutingModule} from './card-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    CardRoutingModule
  ],
  declarations: []
})
export class CardPageModule {
}
