import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {CateringIndexPage} from './index.page';
import {CateringSearchComponent} from '../components/search/search.component';
import {CateringCardComponent} from '../components/card/card.component';
import {CateringListComponent} from '../components/list/list.component';
import {CateringDetailComponent} from '../entryComponents/detail/detail.component';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: CateringIndexPage}])
  ],
  declarations: [
    CateringIndexPage,
    CateringSearchComponent,
    CateringCardComponent,
    CateringListComponent,
    CateringDetailComponent
  ],
  entryComponents: [CateringDetailComponent],
  providers: []
})
export class CateringIndexPageModule {
}
