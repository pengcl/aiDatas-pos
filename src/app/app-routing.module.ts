import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './pages/auth/auth.guard';
import { PickupGuard } from './pages/pickup/pickup.guard';
import { GetTicketGuard } from './pages/getticket/getticket.guard';
import { ShoppingCartGuard } from './pages/shopping-cart/shopping-cart.guard';
import { LayoutPagesComponent } from './@layout/pages/pages.component';
import { LayoutSubComponent } from './@layout/sub/sub.component';
import { LayoutPassportComponent } from './@layout/passport/passport.component';
import { CheckTicketGuard } from './pages/checkticket/checkticket.guard';
import { RefundGuard } from './pages/refund/refund.guard';
import { SupplementGuard } from './pages/supplement/supplement.guard';
import { ReprintGuard } from './pages/reprint/reprint.guard';

import { PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'ticket', role: '70'},
    children: [
      {
        path: '',
        redirectTo: 'ticket',
        pathMatch: 'full'
      },
      {
        path: 'ticket',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/ticket/ticket.module').then(m => m.TicketPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutSubComponent,
    canActivate: [],
    data: {name: 'sub', role: '-1'},
    children: [
      {
        path: '',
        redirectTo: 'sub',
        pathMatch: 'full'
      },
      {
        path: 'sub',
        canActivate: [],
        loadChildren: () => import('./pages/sub/sub.module').then(m => m.SubPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'product', role: '71'},
    children: [
      {
        path: '',
        redirectTo: 'product',
        pathMatch: 'full'
      },
      {
        path: 'product',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/product/product.module').then(m => m.ProductPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'shoppingCart', role: '-1'},
    children: [
      {
        path: '',
        redirectTo: 'shoppingCart',
        pathMatch: 'full'
      },
      {
        path: 'shoppingCart',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/shopping-cart/shopping-cart.module').then(m => m.ShoppingCartPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'checkout', role: '-1'},
    children: [
      {
        path: '',
        redirectTo: 'checkout',
        pathMatch: 'full'
      },
      {
        path: 'checkout',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'catering', role: '792'},
    children: [
      {
        path: '',
        redirectTo: 'catering',
        pathMatch: 'full'
      },
      {
        path: 'catering',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/catering/catering.module').then(m => m.CateringPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'setting', role: '796'},
    children: [
      {
        path: '',
        redirectTo: 'setting',
        pathMatch: 'full'
      },
      {
        path: 'setting',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/setting/setting.module').then(m => m.SettingPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'card', role: '72'},
    children: [
      {
        path: '',
        redirectTo: 'card',
        pathMatch: 'full'
      },
      {
        path: 'card',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/card/card.module').then(m => m.CardPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'vip', role: '73'},
    children: [
      {
        path: '',
        redirectTo: 'vip',
        pathMatch: 'full'
      },
      {
        path: 'vip',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/vip/vip.module').then(m => m.VipPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'coupon', role: '798'},
    children: [
      {
        path: '',
        redirectTo: 'coupon',
        pathMatch: 'full'
      },
      {
        path: 'coupon',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/coupon/coupon.module').then(m => m.CouponPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'points', role: '74'},
    children: [
      {
        path: '',
        redirectTo: 'points',
        pathMatch: 'full'
      },
      {
        path: 'points',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/points/points.module').then(m => m.PointsPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'demo', role: '-1'},
    children: [
      {
        path: '',
        redirectTo: 'demo',
        pathMatch: 'full'
      },
      {
        path: 'demo',
        canActivate: [ShoppingCartGuard],
        loadChildren: () => import('./pages/demo/demo.module').then(m => m.DemoPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'order', role: '799'},
    children: [
      {
        path: '',
        redirectTo: 'order',
        pathMatch: 'full'
      },
      {
        path: 'order',
        loadChildren: () => import('./pages/order/order.module').then(m => m.OrderPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'pickup', role: '76'},
    children: [
      {
        path: '',
        redirectTo: 'pickup',
        pathMatch: 'full'
      },
      {
        path: 'pickup',
        canActivate: [PickupGuard],
        loadChildren: () => import('./pages/pickup/pickup.module').then(m => m.PickupPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [AuthGuard],
    data: {name: 'getticket', role: '75'},
    children: [
      {
        path: '',
        redirectTo: 'getticket',
        pathMatch: 'full'
      },
      {
        path: 'getticket',
        canActivate: [GetTicketGuard, ShoppingCartGuard],
        loadChildren: () => import('./pages/getticket/getticket.module').then(m => m.GetTicketPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [CheckTicketGuard],
    data: {name: 'checkticket', role: '77'},
    children: [
      {
        path: '',
        redirectTo: 'checkticket',
        pathMatch: 'full'
      },
      {
        path: 'checkticket',
        canActivate: [CheckTicketGuard],
        loadChildren: () => import('./pages/checkticket/checkticket.module').then(m => m.CheckTicketPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [RefundGuard],
    data: {name: 'refund', role: '78'},
    children: [
      {
        path: '',
        redirectTo: 'refund',
        pathMatch: 'full'
      },
      {
        path: 'refund',
        canActivate: [RefundGuard],
        loadChildren: () => import('./pages/refund/refund.module').then(m => m.RefundPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [SupplementGuard],
    data: {name: 'supplement', role: '79'},
    children: [
      {
        path: '',
        redirectTo: 'supplement',
        pathMatch: 'full'
      },
      {
        path: 'supplement',
        canActivate: [SupplementGuard],
        loadChildren: () => import('./pages/supplement/supplement.module').then(m => m.SupplementPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    canActivate: [ReprintGuard],
    data: {name: 'reprint', role: '793'},
    children: [
      {
        path: '',
        redirectTo: 'reprint',
        pathMatch: 'full'
      },
      {
        path: 'reprint',
        canActivate: [ReprintGuard],
        loadChildren: () => import('./pages/reprint/reprint.module').then(m => m.ReprintPageModule)
      }
    ]
  },
  {
    path: '',
    component: LayoutPagesComponent,
    data: {name: 'denied', role: '-1'},
    children: [
      {
        path: '',
        redirectTo: 'denied',
        pathMatch: 'full'
      },
      {
        path: 'denied',
        loadChildren: () => import('./pages/denied/denied.module').then(m => m.DeniedPageModule)
      }
    ]
  },
  {
    path: 'auth',
    component: LayoutPassportComponent,
    data: {name: 'auth', role: '-1'},
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
  providers: [AuthGuard, ShoppingCartGuard, PickupGuard, GetTicketGuard, CheckTicketGuard, RefundGuard, SupplementGuard, ReprintGuard]
})
export class AppRoutingModule {
}
