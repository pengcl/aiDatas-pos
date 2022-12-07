import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../../@theme/theme.module';
import {SubTicketIndexPage} from './index.page';
import {SubTicketHallSeatsComponent} from './components/seats/seats.component';
import {SubSeatComponent} from './components/seats/seat/seat';
import {SubPlansIndexPage} from '../../plans/index.page';
import {SubPlansFilmComponent} from '../../plans/components/type-film/type-film.component';
import {SubPlansHallComponent} from '../../plans/components/type-hall/type-hall.component';
import {SubPlansTimeComponent} from '../../plans/components/type-time/type-time.component';

const PIPES = [];

const COMPONENTS_DECLARATIONS = [
  SubTicketHallSeatsComponent,
  SubSeatComponent,
  SubPlansIndexPage,
  SubPlansFilmComponent,
  SubPlansHallComponent,
  SubPlansTimeComponent
];

const ENTRY_COMPONENTS_DECLARATIONS = [
  SubPlansIndexPage
];

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: SubTicketIndexPage}])
  ],
  declarations: [
    SubTicketIndexPage,
    ...COMPONENTS_DECLARATIONS,
    ...ENTRY_COMPONENTS_DECLARATIONS,
    ...PIPES
  ],
  entryComponents: [...ENTRY_COMPONENTS_DECLARATIONS]
})
export class SubTicketIndexPageModule {
}
