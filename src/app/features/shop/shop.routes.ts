import { Routes } from '@angular/router';
import { Catalog } from './catalog/catalog';
import { Cart } from './cart/cart';
import { Contact } from './contact/contact';
import { Checkout } from './checkout/checkout';

export const shopRoutes: Routes = [
  { path: 'catalog', component: Catalog },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'contact', component: Contact },
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
];