import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {AuthLoginPage} from './login.page';
import {CinemasComponent} from '../components/cinemas/cinemas';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ThemeModule,
    RouterModule.forChild([{path: '', component: AuthLoginPage}])
  ],
  declarations: [AuthLoginPage, CinemasComponent],
  entryComponents: [CinemasComponent]
})
export class AuthLoginPageModule {
}
