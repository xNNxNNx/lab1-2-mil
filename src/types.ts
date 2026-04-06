export type BookResponseItem = {
  id: number;
  title: string;
  isbn: string;
  pageCount: number;
  authors: string[];
};

export type BookCardItem = {
  id: number;
  title: string;
  authors: string[];
  isbn: string;
  coverBlob: Blob | null;
};

export type GoogleBooksResponse = {
  items?: Array<{
    volumeInfo?: {
      imageLinks?: {
        thumbnail?: string;
      };
    };
  }>;
};
