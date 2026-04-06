import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('./api/booksApi', () => ({
  loadBooks: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: 'The Pragmatic Programmer',
      isbn: '9780201616224',
      authors: ['Andrew Hunt', 'David Thomas'],
      coverBlob: null,
    },
  ]),
}));

describe('App', () => {
  it('shows loaded books on the page', async () => {
    render(<App />);

    expect(screen.getByText('Загрузка книг...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'The Pragmatic Programmer' })).toBeInTheDocument();
    });
  });
});
