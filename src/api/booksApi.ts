import type { BookCardItem, BookResponseItem, GoogleBooksResponse } from '../types';

const BOOKS_API_URL = 'https://fakeapi.extendsclass.com/books';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Не удалось загрузить данные');
  }

  return response.json() as Promise<T>;
}

export async function fetchBooks(): Promise<BookResponseItem[]> {
  return fetchJson<BookResponseItem[]>(BOOKS_API_URL);
}

export async function fetchCoverBlob(isbn: string): Promise<Blob | null> {
  const searchUrl = `${GOOGLE_BOOKS_API_URL}?q=isbn:${isbn}`;
  const data = await fetchJson<GoogleBooksResponse>(searchUrl);
  const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

  if (!thumbnail) {
    return null;
  }

  const imageResponse = await fetch(thumbnail.replace('http://', 'https://'));

  if (!imageResponse.ok) {
    return null;
  }

  return imageResponse.blob();
}

export async function loadBooks(): Promise<BookCardItem[]> {
  const books = await fetchBooks();

  return Promise.all(
    books.map(async (book) => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      isbn: book.isbn,
      coverBlob: await fetchCoverBlob(book.isbn),
    })),
  );
}
