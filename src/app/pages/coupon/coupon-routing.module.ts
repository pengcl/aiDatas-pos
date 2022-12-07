import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CouponGuard} from './coupon.guard';

const routes: Routes = [

  {
    path: 'index',
    children: [
      {
        path: '',
        canDeactivate: [CouponGuard],
        loadChildren: () =>
          import('./index/index.module').then(m => m.CouponIndexPageModule)
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
  providers: [CouponGuard]
})
export class CouponRoutingModule {
}
