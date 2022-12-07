import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {AuthLockPage} from './lock.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ThemeModule,
    RouterModule.forChild([{path: '', component: AuthLockPage}])
  ],
  declarations: [AuthLockPage],
  entryComponents: []
})
export class AuthLockPageModule {
}
