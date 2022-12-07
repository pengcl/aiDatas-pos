import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {CardIndexPage} from './index.page';
import {CardWriteComponent} from '../entryComponents/write/write.component';
import {CardBindComponent} from '../entryComponents/bind/bind.component';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: CardIndexPage}])
  ],
  declarations: [
    CardIndexPage,
    CardWriteComponent,
    CardBindComponent
  ],
  entryComponents: [CardWriteComponent, CardBindComponent],
  providers: []
})
export class CardIndexPageModule {
}
