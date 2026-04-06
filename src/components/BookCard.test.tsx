import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BookCard } from './BookCard';

describe('BookCard', () => {
  const createObjectURL = vi.fn(() => 'blob:test-cover');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it('renders title, authors and image from blob', () => {
    render(
      <BookCard
        title="Clean Code"
        authors={['Robert Martin']}
        coverBlob={new Blob(['cover'], { type: 'image/png' })}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Clean Code' })).toBeInTheDocument();
    expect(screen.getByText('Robert Martin')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Clean Code' })).toHaveAttribute('src', 'blob:test-cover');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder when there is no cover', () => {
    render(<BookCard title="No Cover Book" authors={['Unknown']} coverBlob={null} />);

    expect(screen.getByText('Нет обложки')).toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
