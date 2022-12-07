import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './auth.guard';

const routes: Routes = [

  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./login/login.module').then(m => m.AuthLoginPageModule)
      }
    ]
  },
  {
    path: 'lock',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./lock/lock.module').then(m => m.AuthLockPageModule)
      }
    ]
  },
  {
    path: 'change',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./change/change.module').then(m => m.AuthChangePageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AuthRoutingModule {
}
