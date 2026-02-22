import { Routes } from '@angular/router';
import { Catalog } from './features/shop/catalog/catalog';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  { path: '', component: Catalog },
  { path: '**', redirectTo: '' }
];
