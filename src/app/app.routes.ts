import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.routes').then(m => m.routes) 
  },
  { 
    path: 'books', 
    loadChildren: () => import('./books/books.routes').then(m => m.routes) 
  },
  { 
    path: 'favorites', 
    loadChildren: () => import('./favorites/favorites.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'books' }
];
