import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteBook } from '../../core/models/book.model';
import { BookService } from '../../core/services/book';
import { FavoriteService } from '../../core/services/favorite';

@Component({
  selector: 'app-favorite-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorite-item.html',
  styleUrl: './favorite-item.css',
})
export class FavoriteItem {
  @Input({ required: true }) favorite!: FavoriteBook;
  @Output() removed = new EventEmitter<void>();

  private bookService = inject(BookService);
  private favoriteService = inject(FavoriteService);

  public get coverUrl(): string {
    return this.bookService.getCoverUrl(this.favorite.coverId, 'M');
  }

  public get bookId(): string {
    return this.favorite.bookKey.replace('/works/', '');
  }

  public removeFavorite(): void {
    if (this.favorite.id) {
      this.favoriteService.removeFavorite(this.favorite.id).subscribe({
        next: () => this.removed.emit(),
        error: (err) => console.error('Failed to remove favorite', err)
      });
    }
  }
}
