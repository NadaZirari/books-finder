import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, forkJoin, map } from 'rxjs';
import { BookSearchResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private searchUrl = 'https://openlibrary.org/search.json';
  private worksUrl = 'https://openlibrary.org'; // E.g., /works/OL45804W.json

  public readonly FALLBACK_COVER_URL = 'https://placehold.co/400x600/e2e8f0/475569?text=Couverture+Indisponible';

  constructor() { }

  public searchBooks(query: string, subject?: string, page: number = 1, limit: number = 10): Observable<BookSearchResponse> {
    const commonParams: any = {
      page: page.toString(),
      limit: limit.toString(),
      fields: 'key,title,author_name,first_publish_year,cover_i,language'
    };

    if (subject) {
      commonParams.subject = subject;
    }

    if (query && query.trim()) {
      const q = query.trim();
      const titleParams = { ...commonParams, title: q };
      const authorParams = { ...commonParams, author: q };

      const req1 = this.http.get<BookSearchResponse>(this.searchUrl, { params: titleParams });
      const req2 = this.http.get<BookSearchResponse>(this.searchUrl, { params: authorParams });

      return forkJoin([req1, req2]).pipe(
        map(([res1, res2]) => {
          let combinedDocs = [];
          const keys = new Set();

          const maxLength = Math.max(res1.docs.length, res2.docs.length);
          for (let i = 0; i < maxLength; i++) {
            if (i < res1.docs.length && !keys.has(res1.docs[i].key)) {
              keys.add(res1.docs[i].key);
              combinedDocs.push(res1.docs[i]);
            }
            if (i < res2.docs.length && !keys.has(res2.docs[i].key)) {
              keys.add(res2.docs[i].key);
              combinedDocs.push(res2.docs[i]);
            }
          }

          const lowerQ = q.toLowerCase();
          combinedDocs = combinedDocs.filter(doc => {
            const hasTitle = doc.title && doc.title.toLowerCase().includes(lowerQ);
            const hasAuthor = doc.author_name && doc.author_name.some((a: string) => a.toLowerCase().includes(lowerQ));
            return hasTitle || hasAuthor;
          });

          return {
            numFound: res1.numFound + res2.numFound,
            start: 0,
            numFoundExact: true,
            docs: combinedDocs.slice(0, limit)
          };
        })
      );
    }

    return this.http.get<BookSearchResponse>(this.searchUrl, { params: commonParams });
  }

  public getBookByKey(key: string): Observable<any> {
    const sanitizedKey = key
      .replace('.json', '')
      .trim();

    return this.http.get<any>(`${this.worksUrl}${sanitizedKey}.json`).pipe(
      timeout(10000)
    );
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
