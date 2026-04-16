import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookSearchResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private searchUrl = 'https://openlibrary.org/search.json';
  private worksUrl = 'https://openlibrary.org'; // E.g., /works/OL45804W.json

  public readonly FALLBACK_COVER_URL = 'https://placehold.co/400x600/e2e8f0/475569?text=Couverture+Indisponible';

  constructor() {}

  public searchBooks(query: string, subject?: string, page: number = 1, limit: number = 10): Observable<BookSearchResponse> {
    let params: any = {
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      fields: 'key,title,author_name,first_publish_year,cover_i,language'
    };

    if (subject) {
      params.subject = subject;
    }

    return this.http.get<BookSearchResponse>(this.searchUrl, { params });
  }

  public getBookByKey(key: string): Observable<any> {
    return this.http.get<any>(`${this.worksUrl}${key}.json`);
  }

  public getCoverUrl(coverId: number | undefined | null, size: 'S' | 'M' | 'L' = 'M'): string {
    if (!coverId) return this.FALLBACK_COVER_URL;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }

  public getSubjects(): string[] {
    return [
      'Art', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 
      'History', 'Biography', 'Health', 'Travel', 'Architecture'
    ].sort();
  }
}
