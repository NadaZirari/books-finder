import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule) 
  },
  { 
    path: 'books', 
    loadChildren: () => import('./books/books-module').then(m => m.BooksModule) 
  },
  { 
    path: 'favorites', 
    loadChildren: () => import('./favorites/favorites-module').then(m => m.FavoritesModule),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'books' }
];
