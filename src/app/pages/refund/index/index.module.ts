import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {RefundIndexPage} from './index.page';
import {RefundViewComponent} from '../components/view/view';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: RefundIndexPage}])
  ],
  declarations: [RefundIndexPage, RefundViewComponent]

})
export class RefundIndexPageModule {
}
