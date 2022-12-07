import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GetTicketGuard} from './getticket.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.GetTicketIndexPageModule)
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
  providers: [GetTicketGuard]
})
export class GetTicketIndexRoutingModule {
}
