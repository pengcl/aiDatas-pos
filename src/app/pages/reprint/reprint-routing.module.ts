import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ReprintGuard} from './reprint.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.ReprintIndexPageModule)
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
  providers: [ReprintGuard]
})
export class ReprintIndexRoutingModule {
}
