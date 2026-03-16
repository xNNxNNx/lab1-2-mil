export interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

export function createUser(
  id: number,
  name: string,
  email?: string,
  isActive: boolean = true,
): User {
  const user: User = {
    id,
    name,
    isActive,
  };

  if (email !== undefined) {
    user.email = email;
  }

  return user;
}

export type Genre = 'fiction' | 'non-fiction';

export interface Book {
  title: string;
  author: string;
  year?: number;
  genre: Genre;
}

export function createBook(book: Book): Book {
  return { ...book };
}

export const bookWithYear = createBook({
  title: '1984',
  author: 'George Orwell',
  year: 1949,
  genre: 'fiction',
});

export const bookWithoutYear = createBook({
  title: 'Sapiens',
  author: 'Yuval Noah Harari',
  genre: 'non-fiction',
});

export function calculateArea(shape: 'circle', radius: number): number;
export function calculateArea(shape: 'square', side: number): number;
export function calculateArea(shape: 'circle' | 'square', value: number): number {
  if (shape === 'circle') {
    return Math.PI * value * value;
  }

  return value * value;
}

export type Status = 'active' | 'inactive' | 'new';

export function getStatusColor(status: Status): string {
  switch (status) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'gray';
    case 'new':
      return 'blue';
  }
}

export type StringFormatter = (value: string, uppercase?: boolean) => string;

export const capitalizeFirstLetter: StringFormatter = (value, uppercase = false) => {
  if (value.length === 0) {
    return value;
  }

  const capitalized = value[0].toUpperCase() + value.slice(1);
  return uppercase ? capitalized.toUpperCase() : capitalized;
};

export const trimAndFormat: StringFormatter = (value, uppercase = false) => {
  const trimmed = value.trim();
  return uppercase ? trimmed.toUpperCase() : trimmed;
};

export function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

export interface HasId {
  id: number;
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}
