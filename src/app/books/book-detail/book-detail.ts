import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
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
  public errorThrown: boolean = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');

      if (!rawId) {
        this.errorMessage = 'ID du livre introuvable.';
        this.isLoading = false;
        return;
      }

      const normalizedId = rawId
        .replace('/works/', '')
        .replace('.json', '')
        .trim();

      if (!normalizedId) {
        this.errorMessage = 'ID du livre invalide.';
        this.isLoading = false;
        return;
      }

      this.bookKey = `/works/${normalizedId}`;
      this.fetchBookDetails();
    });
  }

  private fetchBookDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.errorThrown = false;
    this.bookDetail = null;
    this.coverId = null;
    this.title = '';

    this.bookService.getBookByKey(this.bookKey)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (data) => {
          this.bookDetail = data;
          this.title = data?.title || 'Titre indisponible';

          if (Array.isArray(data?.covers) && data.covers.length > 0) {
            this.coverId = data.covers[0];
          }
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.errorMessage = 'Le service Open Library est trop lent. Réessayez dans quelques secondes.';
            return;
          }

          this.errorMessage = 'Impossible de charger les détails du livre.';
        }
      });
  }

  public get coverUrl(): string {
    if (this.errorThrown) return this.bookService.FALLBACK_COVER_URL;
    return this.bookService.getCoverUrl(this.coverId || 0, 'L');
  }

  public handleImageError(): void {
    this.errorThrown = true;
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
        coverId: this.coverId || 0
      }).subscribe();
    }
  }

  public goBack(): void {
    this.location.back();
  }
}
