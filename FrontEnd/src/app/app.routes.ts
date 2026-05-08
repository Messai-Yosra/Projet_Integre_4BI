import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./layouts/main-layout/main-layout.routes').then(m => m.MAIN_LAYOUT_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
