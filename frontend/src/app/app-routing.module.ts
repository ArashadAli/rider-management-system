import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PageNotFoundComponent } from './not-found/not-found.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ChangeProfileComponent } from './features/change-profile/change-profile.component';

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
        children: [
          {
            path: '',
            data: { breadcrumb: 'Orders' },
            loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
          }
        ],
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
        path: 'profile',
        children: [
          {
            path: '',
            data: { breadcrumb: 'User Profile' },
            loadComponent: () =>
              import('./features/profile/profile.component')
                .then(m => m.ProfileComponent)
          }
        ]
      },
      {
        path: 'settings/profile',
        children: [
          {
            path:'',
            data: { breadcrumb: 'profile-settings'},
            loadComponent: () => 
              import('./features/change-profile/change-profile.component')
                .then(m => m.ChangeProfileComponent)
          }
        ]
      },
      {
        path: 'settings/change-password',
        children: [
          {
            path:'',
            data: { breadcrumb: 'password-settings'},
            loadComponent: () => 
              import('./features/change-password/change-password.component')
                .then(m => m.ChangePasswordComponent)
          }
        ]
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