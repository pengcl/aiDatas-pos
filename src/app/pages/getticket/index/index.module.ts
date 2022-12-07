import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {GetTicketIndexPage} from './index.page';
import {AlertmsgComponent} from '../../auth/components/alertmsg/alertmsg';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: GetTicketIndexPage}])
  ],
  declarations: [GetTicketIndexPage, AlertmsgComponent],
  entryComponents: [AlertmsgComponent]

})
export class GetTicketIndexPageModule {
}
