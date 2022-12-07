import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {RechargeIndexPage} from './index.page';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: RechargeIndexPage}])
  ],
  declarations: [
    RechargeIndexPage
  ],
  entryComponents: [],
  providers: []
})
export class RechargeIndexPageModule {
}
