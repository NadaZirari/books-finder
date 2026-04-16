export interface Book {
  key: string;
  title: string;
  authorName: string[];
  firstPublishYear: number;
  coverId: number;
  language: string[];
}

export interface BookSearchResponse {
  numFound: number;
  docs: any[];
}

export interface FavoriteBook {
  id?: string; // json-server generates string IDs for some versions, or number.
  userId: number;
  bookKey: string;
  title: string;
  author: string;
  coverId: number;
}
