import { Routes } from '@angular/router';
import { Catalog } from './features/shop/catalog/catalog';
import { authRoutes } from './features/auth/auth.routes';
import { adminRoutes } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'admin',
    children: adminRoutes
  },
  { path: '', component: Catalog },
  { path: '**', redirectTo: '' }
];
