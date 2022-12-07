import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TicketGuard} from './ticket.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        canDeactivate: [TicketGuard],
        loadChildren: () =>
          import('./index/index.module').then(m => m.TicketIndexPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full'

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [TicketGuard]
})
export class TicketRoutingModule {
}
