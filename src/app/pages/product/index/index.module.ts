import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {ProductIndexPage} from './index.page';
import {ProductCatalogsComponent} from '../components/catalogs/catalogs.component';
import {ProductGoodsComponent} from '../components/goods/goods.component';
import {ProductPreviewComponent} from '../components/preview/preview.component';
import {ProductPackageComponent} from '../entryComponents/package/package.component';
import {HangUpComponent} from '../entryComponents/hang-up/hang-up.component';
import {HangUpDirective} from '../directives/hang-up/hang-up';
import {SelectedPipe} from '../entryComponents/package/package.pipe';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: ProductIndexPage}])
  ],
  declarations: [
    ProductIndexPage,
    ProductCatalogsComponent,
    ProductGoodsComponent,
    ProductPreviewComponent,
    ProductPackageComponent,
    HangUpComponent,
    HangUpDirective,
    SelectedPipe
  ],
  entryComponents: [ProductPackageComponent, HangUpComponent],
  providers: []
})
export class ProductIndexPageModule {
}
