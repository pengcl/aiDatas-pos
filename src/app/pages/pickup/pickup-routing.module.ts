import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PickupGuard} from './pickup.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.PickupIndexPageModule)
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
  providers: [PickupGuard]
})
export class PickupIndexRoutingModule {
}
