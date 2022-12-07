import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {SubSleepingPage} from './sleeping.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ThemeModule,
    RouterModule.forChild([{path: '', component: SubSleepingPage}])
  ],
  declarations: [SubSleepingPage],
  entryComponents: []
})
export class SubSleepingPageModule {
}
