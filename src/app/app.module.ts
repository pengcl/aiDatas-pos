import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule } from '@ionic/angular';

import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutPassportComponent } from './@layout/passport/passport.component';
import { LayoutPagesComponent } from './@layout/pages/pages.component';
import { LayoutSubComponent } from './@layout/sub/sub.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { TicketPageModule } from './pages/ticket/ticket.module';

registerLocaleData(zh);

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    IonicModule.forRoot({
      mode: 'ios',
      hardwareBackButton: false,
      swipeBackEnabled: false
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    BrowserAnimationsModule,
    FormsModule,
    TicketPageModule
  ],
  declarations: [AppComponent, LayoutPagesComponent, LayoutPassportComponent, LayoutSubComponent],
  providers: [
    InAppBrowser,
    SplashScreen,
    StatusBar,
    {provide: 'PREFIX_URL', useValue: environment.apiPrefix},
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
