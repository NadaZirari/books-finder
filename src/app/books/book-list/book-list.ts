import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../core/services/book';
import { Book } from '../../core/models/book.model';
import { Search } from '../search/search';
import { BookItem } from '../book-item/book-item';
import { Pagination } from '../../shared/pagination/pagination';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, Search, BookItem, Pagination, Loader],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList implements OnInit {
  private bookService = inject(BookService);

  public books: Book[] = [];
  public isLoading: boolean = false;
  public errorMessage: string = '';
  
  public currentPage: number = 1;
  public totalPages: number = 1;
  public totalResults: number = 0;
  private limit: number = 10;
  
  private currentQuery: string = 'angular';
  private currentSubject: string = '';

  ngOnInit() {
    this.fetchBooks();
  }

  public onSearch(event: { query: string, subject: string }): void {
    this.currentQuery = event.query;
    this.currentSubject = event.subject;
    this.currentPage = 1;
    this.fetchBooks();
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private fetchBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.books = []; // clear previous

    this.bookService.searchBooks(this.currentQuery, this.currentSubject, this.currentPage, this.limit)
      .subscribe({
        next: (response) => {
          this.totalResults = response.numFound || 0;
          this.totalPages = Math.ceil(this.totalResults / this.limit);
          this.books = response.docs.map(doc => ({
            key: doc.key,
            title: doc.title,
            authorName: doc.author_name,
            firstPublishYear: doc.first_publish_year,
            coverId: doc.cover_i,
            language: doc.language
          }));
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = "Une erreur est survenue lors de la recherche des livres.";
        }
      });
  }
}
