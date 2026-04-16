import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book';
import { FavoriteService } from '../../core/services/favorite';
import { AuthService } from '../../core/services/auth';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Loader],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  public favoriteService = inject(FavoriteService);
  public authService = inject(AuthService);
  private location = inject(Location);

  public bookDetail: any = null;
  public isLoading: boolean = true;
  public errorMessage: string = '';
  public bookKey: string = '';
  public coverId: number | null = null;
  public title: string = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookKey = `/works/${id}`;
      this.fetchBookDetails();
    } else {
      this.errorMessage = 'ID du livre introuvable.';
      this.isLoading = false;
    }
  }

  private fetchBookDetails(): void {
    this.isLoading = true;
    this.bookService.getBookByKey(this.bookKey).subscribe({
      next: (data) => {
        this.bookDetail = data;
        this.title = data.title;
        // OpenLibrary's /works api often returns covers as an array of IDs
        if (data.covers && data.covers.length > 0) {
          this.coverId = data.covers[0];
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les détails du livre.';
      }
    });
  }

  public get coverUrl(): string {
    return this.bookService.getCoverUrl(this.coverId, 'L');
  }

  public get isFavorite(): boolean {
    return this.favoriteService.isFavorite(this.bookKey);
  }

  public toggleFavorite(): void {
    const user = this.authService.getCurrentUser();
    if (!user || (!user.id && user.id !== 0)) return;

    if (this.isFavorite) {
      const fav = this.favoriteService['favoritesSubject'].value.find(f => f.bookKey === this.bookKey);
      if (fav && fav.id) {
        this.favoriteService.removeFavorite(fav.id).subscribe();
      }
    } else {
      // Author info is sometimes nested or simple string in the /works endpoint
      // We will try our best or fallback to 'Inconnu'
      let authorName = 'Auteur inconnu';
      if (this.bookDetail && this.bookDetail.authors && this.bookDetail.authors[0]) {
         authorName = this.bookDetail.authors[0].author?.key ? 'Géré par OpenLibrary' : 'Auteur inconnu';
      }

      this.favoriteService.addFavorite({
        userId: user.id as number,
        bookKey: this.bookKey,
        title: this.title,
        author: authorName,
        coverId: this.coverId || undefined
      }).subscribe();
    }
  }

  public goBack(): void {
    this.location.back();
  }
}
