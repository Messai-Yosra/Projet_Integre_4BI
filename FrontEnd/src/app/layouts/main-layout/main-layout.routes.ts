import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

export const MAIN_LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../../pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'dashboard/:slug',
        loadComponent: () => import('../../pages/dashboard-view/dashboard-view.component').then(m => m.DashboardViewComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('../../pages/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../../pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
