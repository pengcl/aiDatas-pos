import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../../@theme/theme.module';
import {SubCheckoutIndexPage} from './index.page';
import {SubCheckoutCartPage} from '../components/cart/cart.page';
import {SubCheckoutCheckPage} from '../components/check/check.page';
import {SubCheckoutActivitiesPage} from '../components/activities/activities.page';

const PIPES = [];

const COMPONENTS_DECLARATIONS = [
  SubCheckoutCartPage,
  SubCheckoutCheckPage,
  SubCheckoutActivitiesPage
];

const ENTRY_COMPONENTS_DECLARATIONS = [
];

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: SubCheckoutIndexPage}])
  ],
  declarations: [
    SubCheckoutIndexPage,
    ...COMPONENTS_DECLARATIONS,
    ...ENTRY_COMPONENTS_DECLARATIONS,
    ...PIPES
  ],
  entryComponents: [...ENTRY_COMPONENTS_DECLARATIONS]
})
export class SubCheckoutIndexPageModule {
}
