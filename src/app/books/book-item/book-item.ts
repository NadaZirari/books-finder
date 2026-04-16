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

  public errorThrown = false;
  private favoriteOverride: boolean | null = null;

  public get coverUrl(): string {
    if (this.errorThrown) return this.bookService.FALLBACK_COVER_URL;
    return this.bookService.getCoverUrl(this.book?.coverId || 0, 'M');
  }

  public handleImageError(): void {
    this.errorThrown = true;
  }

  public get bookId(): string {
    return this.book?.key ? this.book.key.replace('/works/', '') : '';
  }

  public get isFavorite(): boolean {
    if (!this.book?.key) return false;
    if (this.favoriteOverride !== null) return this.favoriteOverride;
    return this.favoriteService.isFavorite(this.book.key);
  }

  public toggleFavorite(): void {
    if (!this.book || !this.book.key) return;
    const user = this.authService.getCurrentUser();
    if (!user || (!user.id && user.id !== 0)) return;

    if (this.isFavorite) {
      const fav = this.favoriteService.getFavoriteByBookKey(this.book.key);
      if (fav && fav.id) {
        this.favoriteOverride = false;
        this.favoriteService.removeFavorite(fav.id).subscribe({
          next: () => {
            this.favoriteOverride = null;
          },
          error: () => {
            this.favoriteOverride = null;
          }
        });
      }
    } else {
      this.favoriteOverride = true;
      this.favoriteService.addFavorite({
        userId: user.id as number,
        bookKey: this.book.key,
        title: this.book.title || 'Inconnu',
        author: (this.book.authorName && this.book.authorName.length > 0) ? this.book.authorName[0] : 'Inconnu',
        coverId: this.book.coverId || 0
      }).subscribe({
        next: () => {
          this.favoriteOverride = null;
        },
        error: () => {
          this.favoriteOverride = null;
        }
      });
    }
  }
}
