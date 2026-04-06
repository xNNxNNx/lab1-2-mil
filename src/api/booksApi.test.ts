import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchBooks, fetchCoverBlob, loadBooks } from './booksApi';

describe('booksApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads books list from api', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            title: 'Clean Code',
            isbn: '9780132350884',
            pageCount: 464,
            authors: ['Robert Martin'],
          },
        ]),
        { status: 200 },
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchBooks()).resolves.toEqual([
      {
        id: 1,
        title: 'Clean Code',
        isbn: '9780132350884',
        pageCount: 464,
        authors: ['Robert Martin'],
      },
    ]);
  });

  it('loads cover blob when google books returns a thumbnail', async () => {
    const imageBlob = new Blob(['cover'], { type: 'image/jpeg' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                volumeInfo: {
                  imageLinks: {
                    thumbnail: 'http://example.com/cover.jpg',
                  },
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(imageBlob, { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCoverBlob('9780132350884');

    expect(result).toBeInstanceOf(Blob);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://www.googleapis.com/books/v1/volumes?q=isbn:9780132350884',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://example.com/cover.jpg');
  });

  it('loads books together with covers', async () => {
    const imageBlob = new Blob(['cover'], { type: 'image/jpeg' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 1,
              title: 'Clean Code',
              isbn: '9780132350884',
              pageCount: 464,
              authors: ['Robert Martin'],
            },
          ]),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                volumeInfo: {
                  imageLinks: {
                    thumbnail: 'http://example.com/cover.jpg',
                  },
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(imageBlob, { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    await expect(loadBooks()).resolves.toEqual([
      {
        id: 1,
        title: 'Clean Code',
        isbn: '9780132350884',
        authors: ['Robert Martin'],
        coverBlob: imageBlob,
      },
    ]);
  });
});
