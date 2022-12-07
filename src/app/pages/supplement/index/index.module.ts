import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {SupplementIndexPage} from './index.page';
import {ViewComponent} from '../components/view/view';


@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: SupplementIndexPage}])
  ],
  declarations: [SupplementIndexPage, ViewComponent]
})
export class SupplementIndexPageModule {
}
