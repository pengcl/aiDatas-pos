import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RefundGuard} from './refund.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.RefundIndexPageModule)
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
  providers: [RefundGuard]
})
export class RefundIndexRoutingModule {
}
