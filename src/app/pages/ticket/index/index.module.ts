import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ThemeModule} from '../../../@theme/theme.module';
import {TicketIndexPage} from './index.page';
import {TicketPlansComponent} from './components/plans/plans.component';
import {TicketPlansTypeFilmComponent} from './components/plans/components/type-film/type-film.component';
import {TicketPlansTypeHallComponent} from './components/plans/components/type-hall/type-hall.component';
import {TicketPlansTypeTimeComponent} from './components/plans/components/type-time/type-time.component';
import {TicketHallComponent} from './components/hall/hall.component';
import {TicketHallSeatsComponent} from './components/hall/components/seats/seats.component';
import {TicketTicketsComponent} from './components/tickets/tickets.page';
import {SeatComponent} from './components/hall/components/seats/seat/seat';

import {TicketHallBookComponent} from './components/hall/components/book/book.component';
import {TicketHallNotificationComponent} from './components/hall/components/notification/notification.component';
import {BillDetailComponent} from './components/hall/components/billdetail/billdetail.component';
import {BookdetailComponent} from './components/hall/components/bookdetail/bookdetail.component';
import {TicketPlansTypeFilmFullComponent} from './components/plans/components/type-film/full/type-film-full.component';
import {TicketPlansFullComponent} from './components/plans/full/plans-full.component';
import {TicketPlansTypeTimeFullComponent} from './components/plans/components/type-time/full/type-time-full.component';
import {TicketPlansTypeHallFullComponent} from './components/plans/components/type-hall/full/type-hall-full.component';

import {TimeHeightPipe} from '../ticket.pipe';

const PIPES = [TimeHeightPipe];

const COMPONENTS_DECLARATIONS = [
  TicketPlansComponent,
  TicketPlansTypeFilmComponent,
  TicketPlansTypeHallComponent,
  TicketPlansTypeTimeComponent,
  TicketHallComponent,
  TicketHallSeatsComponent,
  TicketTicketsComponent,
  SeatComponent,
  BillDetailComponent,
  BookdetailComponent,
  TicketPlansFullComponent,
  TicketPlansTypeFilmFullComponent,
  TicketPlansTypeTimeFullComponent,
  TicketPlansTypeHallFullComponent
];

const ENTRY_COMPONENTS_DECLARATIONS = [
  TicketHallBookComponent,
  TicketHallNotificationComponent,
  BillDetailComponent,
  BookdetailComponent,
  TicketPlansFullComponent
];

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: TicketIndexPage}])
  ],
  declarations: [
    TicketIndexPage,
    ...COMPONENTS_DECLARATIONS,
    ...ENTRY_COMPONENTS_DECLARATIONS,
    ...PIPES
  ],
  entryComponents: [...ENTRY_COMPONENTS_DECLARATIONS]
})
export class TicketIndexPageModule {
}
