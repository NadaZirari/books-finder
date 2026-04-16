import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { FavoriteBook } from '../models/book.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/favoriteBooks';

  private favoritesSubject = new BehaviorSubject<FavoriteBook[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        this.loadFavorites(user.id);
      } else {
        this.favoritesSubject.next([]);
      }
    });
  }

  public loadFavorites(userId: number): void {
    this.http.get<FavoriteBook[]>(this.apiUrl, { params: { userId: userId.toString() } })
      .subscribe(favorites => this.favoritesSubject.next(favorites));
  }

  public addFavorite(favorite: FavoriteBook): Observable<FavoriteBook> {
    return this.http.post<FavoriteBook>(this.apiUrl, favorite).pipe(
      tap(newFav => {
        const current = this.favoritesSubject.value;
        this.favoritesSubject.next([...current, newFav]);
      })
    );
  }

  public removeFavorite(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.favoritesSubject.value.filter(f => f.id !== id);
        this.favoritesSubject.next(current);
      })
    );
  }

  public isFavorite(bookKey: string): boolean {
    return this.favoritesSubject.value.some(f => f.bookKey === bookKey);
  }
}
