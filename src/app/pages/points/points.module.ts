import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ThemeModule} from '../../@theme/theme.module';
import {PointsRoutingModule} from './points-routing.module';

@NgModule({
  imports: [
    IonicModule,
    ThemeModule,
    PointsRoutingModule
  ],
  declarations: []
})
export class PointsPageModule {
}
