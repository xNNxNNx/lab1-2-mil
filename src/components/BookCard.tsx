import { useEffect, useState } from 'react';

import './BookCard.css';

type BookCardProps = {
  title: string;
  authors: string[];
  coverBlob: Blob | null;
};

export function BookCard({ title, authors, coverBlob }: BookCardProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!coverBlob) {
      setCoverUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverBlob);
    setCoverUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverBlob]);

  return (
    <article className="book-card">
      {coverUrl ? (
        <img className="book-card__cover" src={coverUrl} alt={title} />
      ) : (
        <div className="book-card__placeholder">Нет обложки</div>
      )}
      <h2 className="book-card__title">{title}</h2>
      <p className="book-card__authors">{authors.join(', ')}</p>
    </article>
  );
}
