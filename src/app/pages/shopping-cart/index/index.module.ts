import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {ShoppingCartIndexPage} from './index.page';
import {ShoppingCartChangeComponent} from '../entryComponents/change/change.component';
import {CartChangeTypeComponent} from '../entryComponents/changeType/changeType.component';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: ShoppingCartIndexPage}])
  ],
  declarations: [
    ShoppingCartIndexPage,
    ShoppingCartChangeComponent,
    CartChangeTypeComponent
  ],
  entryComponents: [ShoppingCartChangeComponent, CartChangeTypeComponent]
})
export class ShoppingCartIndexPageModule {
}
