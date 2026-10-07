import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PageNotFoundComponent } from './not-found/not-found.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { ManageComponent } from './features/manage/manage.component';
import { SettingsComponent } from './features/settings/settings.component';

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders.component')
            .then(m => m.OrdersComponent)
      },
      {
        path: 'riders',
        children: [
          {
            path: '',
            data: { breadcrumb: 'Riders' },
            loadComponent: () =>
              import('./features/riders/riders.component')
                .then(m => m.RidersComponent)
          },
          {
            path: ':id',
            data: { breadcrumb: 'Rider Profile' },
            loadComponent: () =>
              import('./features/riders/riders.component')
                .then(m => m.RidersComponent)
          }
        ],
        loadComponent: () =>
          import('./features/riders/riders.component')
            .then(m => m.RidersComponent)
      },
      {
        path: 'manage',
        loadComponent: () =>
          import('./features/manage/manage.component')
            .then(m => m.ManageComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component')
            .then(m => m.SettingsComponent)
      }
    ],
  },
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }