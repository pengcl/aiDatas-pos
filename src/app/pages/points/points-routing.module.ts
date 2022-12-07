import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PointsGuard} from './points.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        canDeactivate: [PointsGuard],
        loadChildren: () =>
          import('./index/index.module').then(m => m.PointsIndexPageModule)
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
  providers: [PointsGuard]
})
export class PointsRoutingModule {
}
