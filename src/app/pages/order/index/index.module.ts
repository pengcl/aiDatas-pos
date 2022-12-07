import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {OrderIndexPage} from './index.page';
import {ChannelViewComponent} from '../components/view/channelview';
import {StaffViewComponent} from '../components/staff/staff';

@NgModule({
  imports: [
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: OrderIndexPage}])
  ],
  declarations: [
    OrderIndexPage, ChannelViewComponent, StaffViewComponent
  ],
  entryComponents: []
})
export class OrderIndexPageModule {
}
