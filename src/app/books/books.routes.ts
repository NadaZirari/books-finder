import { Routes } from '@angular/router';
import { BookList } from './book-list/book-list';
import { BookDetail } from './book-detail/book-detail';

export const routes: Routes = [
  { path: '', component: BookList },
  { path: 'detail/:id', component: BookDetail }
];
