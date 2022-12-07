import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckTicketGuard} from './checkticket.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.CheckTicketIndexPageModule)
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
  providers: [CheckTicketGuard]
})
export class CheckTicketIndexRoutingModule {
}
