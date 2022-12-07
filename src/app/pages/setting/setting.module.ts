import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {SettingRoutingModule} from './setting-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    SettingRoutingModule
  ],
  declarations: []
})
export class SettingPageModule {
}
