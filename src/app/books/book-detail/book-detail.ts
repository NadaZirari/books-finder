import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  public bookDetail: any = null;
  public isLoading: boolean = true;
  public errorMessage: string = '';
  public bookKey: string = '';
  public coverId: number | null = null;
  public title: string = '';
  public errorThrown: boolean = false;
  private favoriteOverride: boolean | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');

      if (!rawId) {
        this.errorMessage = 'ID du livre introuvable.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      const normalizedId = rawId
        .replace('/works/', '')
        .replace('.json', '')
        .trim();

      if (!normalizedId) {
        this.errorMessage = 'ID du livre invalide.';
        this.isLoading = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.bookDetail = data;
          this.title = data?.title || 'Titre indisponible';

          if (Array.isArray(data?.covers) && data.covers.length > 0) {
            this.coverId = data.covers[0];
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.errorMessage = 'Le service Open Library est trop lent. Réessayez dans quelques secondes.';
          } else {
            this.errorMessage = 'Impossible de charger les détails du livre.';
          }
          this.cdr.detectChanges();
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
    if (this.favoriteOverride !== null) return this.favoriteOverride;
    return this.favoriteService.isFavorite(this.bookKey);
  }

  public toggleFavorite(): void {
    const user = this.authService.getCurrentUser();
    if (!user || (!user.id && user.id !== 0)) return;

    if (this.isFavorite) {
      const fav = this.favoriteService.getFavoriteByBookKey(this.bookKey);
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
      // Author info is sometimes nested or simple string in the /works endpoint
      // We will try our best or fallback to 'Inconnu'
      let authorName = 'Auteur inconnu';
      if (this.bookDetail && this.bookDetail.authors && this.bookDetail.authors[0]) {
         authorName = this.bookDetail.authors[0].author?.key ? 'Géré par OpenLibrary' : 'Auteur inconnu';
      }

      this.favoriteOverride = true;
      this.favoriteService.addFavorite({
        userId: user.id as number,
        bookKey: this.bookKey,
        title: this.title,
        author: authorName,
        coverId: this.coverId || 0
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

  public goBack(): void {
    this.location.back();
  }
}
