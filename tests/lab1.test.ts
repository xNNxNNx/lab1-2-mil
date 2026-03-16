import { describe, expect, it } from 'vitest';

import {
  bookWithYear,
  bookWithoutYear,
  calculateArea,
  capitalizeFirstLetter,
  createBook,
  createUser,
  findById,
  getFirstElement,
  getStatusColor,
  trimAndFormat,
} from '../src/lab1';

describe('createUser', () => {
  it('creates user with default isActive', () => {
    const user = createUser(1, 'Ivan', 'ivan@example.com');

    expect(user).toEqual({
      id: 1,
      name: 'Ivan',
      email: 'ivan@example.com',
      isActive: true,
    });
  });

  it('creates user without optional email', () => {
    const user = createUser(2, 'Maria');

    expect(user).toEqual({
      id: 2,
      name: 'Maria',
      isActive: true,
    });
  });

  it('creates user with explicit isActive', () => {
    const user = createUser(3, 'Petr', undefined, false);

    expect(user).toEqual({
      id: 3,
      name: 'Petr',
      isActive: false,
    });
  });
});

describe('createBook', () => {
  it('returns book with year', () => {
    const book = createBook({
      title: 'Test Title',
      author: 'Test Author',
      year: 2020,
      genre: 'fiction',
    });

    expect(book).toEqual({
      title: 'Test Title',
      author: 'Test Author',
      year: 2020,
      genre: 'fiction',
    });
  });

  it('returns book without optional year', () => {
    const book = createBook({
      title: 'No Year',
      author: 'Anon',
      genre: 'non-fiction',
    });

    expect(book).toEqual({
      title: 'No Year',
      author: 'Anon',
      genre: 'non-fiction',
    });
  });

  it('contains demonstration books', () => {
    expect(bookWithYear.year).toBe(1949);
    expect(bookWithoutYear.year).toBeUndefined();
  });
});

describe('calculateArea', () => {
  it('calculates circle area', () => {
    expect(calculateArea('circle', 2)).toBeCloseTo(12.566370614359172);
  });

  it('calculates square area', () => {
    expect(calculateArea('square', 4)).toBe(16);
  });
});

describe('getStatusColor', () => {
  it('returns green for active', () => {
    expect(getStatusColor('active')).toBe('green');
  });

  it('returns gray for inactive', () => {
    expect(getStatusColor('inactive')).toBe('gray');
  });

  it('returns blue for new', () => {
    expect(getStatusColor('new')).toBe('blue');
  });
});

describe('StringFormatter implementations', () => {
  it('capitalizes first letter', () => {
    expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
  });

  it('capitalizes and uppercases when flag is true', () => {
    expect(capitalizeFirstLetter('hello world', true)).toBe('HELLO WORLD');
  });

  it('trims string', () => {
    expect(trimAndFormat('  hello world  ')).toBe('hello world');
  });

  it('trims and uppercases when flag is true', () => {
    expect(trimAndFormat('  hello world  ', true)).toBe('HELLO WORLD');
  });
});

describe('getFirstElement', () => {
  it('returns first number from number array', () => {
    expect(getFirstElement([10, 20, 30])).toBe(10);
  });

  it('returns first string from string array', () => {
    expect(getFirstElement(['a', 'b', 'c'])).toBe('a');
  });

  it('returns undefined for empty array', () => {
    expect(getFirstElement<number>([])).toBeUndefined();
  });
});

describe('findById', () => {
  it('finds object by id', () => {
    const items = [
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
    ];

    expect(findById(items, 2)).toEqual({ id: 2, name: 'two' });
  });

  it('returns undefined when id does not exist', () => {
    const items = [
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
    ];

    expect(findById(items, 3)).toBeUndefined();
  });
});
