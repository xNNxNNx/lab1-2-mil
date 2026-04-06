import { useEffect, useState } from 'react';

import { loadBooks } from './api/booksApi';
import { BookGrid } from './components/BookGrid';
import type { BookCardItem } from './types';
import './App.css';

export default function App() {
  const [books, setBooks] = useState<BookCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        const loadedBooks = await loadBooks();

        if (active) {
          setBooks(loadedBooks);
        }
      } catch {
        if (active) {
          setError('Не удалось загрузить книги');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page">
      <div className="page__intro">
        <p className="page__eyebrow">Домашнее задание 7</p>
        <h1 className="page__title">Каталог книг</h1>
        <p className="page__subtitle">
          React-приложение загружает книги по API и показывает карточки с обложкой, названием и
          авторами.
        </p>
      </div>

      {loading && <p className="page__status">Загрузка книг...</p>}
      {!loading && error && <p className="page__status page__status_error">{error}</p>}
      {!loading && !error && <BookGrid books={books} />}
    </main>
  );
}
