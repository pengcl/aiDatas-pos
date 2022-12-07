import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [

  {
    path: 'ticket',
    children: [
      {
        path: '',
        canDeactivate: [],
        loadChildren: () =>
          import('./ticket/index/index.module').then(m => m.SubTicketIndexPageModule)
      }
    ]
  },
  {
    path: 'checkout',
    children: [
      {
        path: '',
        canDeactivate: [],
        loadChildren: () =>
          import('./checkout/index/index.module').then(m => m.SubCheckoutIndexPageModule)
      }
    ]
  },
  {
    path: 'sleeping',
    children: [
      {
        path: '',
        canDeactivate: [],
        loadChildren: () =>
          import('./sleeping/sleeping.module').then(m => m.SubSleepingPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'ticket',
    pathMatch: 'full'

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SubRoutingModule {
}
