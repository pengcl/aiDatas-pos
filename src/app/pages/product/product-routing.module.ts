import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductGuard} from './product.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        canDeactivate: [ProductGuard],
        loadChildren: () =>
          import('./index/index.module').then(m => m.ProductIndexPageModule)
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
  providers: [ProductGuard]
})
export class ProductRoutingModule {
}
