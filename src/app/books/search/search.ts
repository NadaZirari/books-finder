import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../core/services/book';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);

  @Output() searchEvent = new EventEmitter<{ query: string, subject: string }>();

  public searchForm: FormGroup = this.fb.group({
    query: [''],
    subject: ['']
  });

  public subjects: string[] = [];

  ngOnInit() {
    this.subjects = this.bookService.getSubjects();
  }

  public onSubmit(): void {
    const { query, subject } = this.searchForm.value;
    if (query.trim() || subject) {
      this.searchEvent.emit({ query: query.trim(), subject });
    }
  }
}
