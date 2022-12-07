import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {OverlayModule} from '@angular/cdk/overlay';
import {MenuExtraComponent} from './components/extra/extra';
import {MenuExtraDirective} from './directives/extra/extra';
import {MenuComponent} from './menu';

@NgModule({
  imports: [CommonModule, RouterModule, IonicModule, OverlayModule],
  declarations: [MenuComponent, MenuExtraComponent, MenuExtraDirective],
  exports: [MenuComponent, MenuExtraComponent, MenuExtraDirective],
  entryComponents: [MenuExtraComponent]
})
export class MenuModule {
}
