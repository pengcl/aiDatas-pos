import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupplementGuard} from './supplement.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.SupplementIndexPageModule)
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
  providers: [SupplementGuard]
})
export class SupplementIndexRoutingModule {
}
