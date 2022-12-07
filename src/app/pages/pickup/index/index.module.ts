import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {PickupIndexPage} from './index.page';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: PickupIndexPage}])
  ],
  declarations: [
    PickupIndexPage
  ]
})
export class PickupIndexPageModule {
}
