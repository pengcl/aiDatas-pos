import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {PointsIndexPage} from './index.page';
import {PointsCartComponent} from '../components/cart/cart.component';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: PointsIndexPage}])
  ],
  declarations: [
    PointsIndexPage,
    PointsCartComponent
  ],
  entryComponents: [],
  providers: []
})
export class PointsIndexPageModule {
}
