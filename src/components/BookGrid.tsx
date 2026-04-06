import type { BookCardItem } from '../types';
import { BookCard } from './BookCard';
import './BookGrid.css';

type BookGridProps = {
  books: BookCardItem[];
};

export function BookGrid({ books }: BookGridProps) {
  return (
    <section className="book-grid" aria-label="Список книг">
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          authors={book.authors}
          coverBlob={book.coverBlob}
        />
      ))}
    </section>
  );
}
