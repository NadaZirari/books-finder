import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Book } from '../../core/models/book.model';
import { BookService } from '../../core/services/book';
import { FavoriteService } from '../../core/services/favorite';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-book-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-item.html',
  styleUrl: './book-item.css',
})
export class BookItem {
  @Input({ required: true }) book!: Book;

  public bookService = inject(BookService);
  public favoriteService = inject(FavoriteService);
  public authService = inject(AuthService);

  public get coverUrl(): string {
    return this.bookService.getCoverUrl(this.book.coverId, 'M');
  }

  public get bookId(): string {
    return this.book.key.replace('/works/', '');
  }

  public get isFavorite(): boolean {
    return this.favoriteService.isFavorite(this.book.key);
  }

  public toggleFavorite(): void {
    const user = this.authService.getCurrentUser();
    if (!user || (!user.id && user.id !== 0)) return;

    if (this.isFavorite) {
      // Find the ID of the favorite mapped to this key to delete it
      // But we need the DB id. It's safer to not allow removal from list if we don't have the id, 
      // but let's implement add only or fetch the favorite object
      const fav = this.favoriteService['favoritesSubject'].value.find(f => f.bookKey === this.book.key);
      if (fav && fav.id) {
        this.favoriteService.removeFavorite(fav.id).subscribe();
      }
    } else {
      this.favoriteService.addFavorite({
        userId: user.id as number,
        bookKey: this.book.key,
        title: this.book.title,
        author: this.book.authorName ? this.book.authorName[0] : 'Inconnu',
        coverId: this.book.coverId
      }).subscribe();
    }
  }
}
