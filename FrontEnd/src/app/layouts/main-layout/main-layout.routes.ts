import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export const MAIN_LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('../../pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'dashboard/:slug',
        loadComponent: () =>
          import('../../pages/dashboard-view/dashboard-view.component').then(
            m => m.DashboardViewComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../../pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      // ── Admin routes ──────────────────────────────────────────────────
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('../../pages/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'admin/roles',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('../../pages/roles/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'admin/dashboards',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('../../pages/dashboards-admin/dashboards-admin.component').then(
            m => m.DashboardsAdminComponent
          )
      },
      {
        path: 'admin/email-settings',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('../../pages/email-settings/email-settings.component').then(
            m => m.EmailSettingsComponent
          )
      },
      // Legacy redirect for old /users link
      {
        path: 'users',
        redirectTo: 'admin/users',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
