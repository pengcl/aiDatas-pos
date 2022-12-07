import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShoppingCartGuard} from './shopping-cart.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./index/index.module').then(m => m.ShoppingCartIndexPageModule)
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
  providers: [ShoppingCartGuard]
})
export class ShoppingCartRoutingModule {
}
