import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [

  {
    path: 'table',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./table/table.module').then(m => m.DemoTablePageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'table',
    pathMatch: 'full'

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class DemoRoutingModule {
}
