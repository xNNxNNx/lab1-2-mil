import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  groupBy,
  having,
  query,
  sort,
  where,
  type Group,
} from '../src/lab5';

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const users: User[] = [
  { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
  { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
  { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
  { id: 4, name: 'Mike', surname: 'Doe', age: 35, city: 'LA' },
];

const userWhere = where<User>();
const userGroupBy = groupBy<User>();
const userHaving = having<User>();
const userSort = sort<User>();
const groupSort = sort<Group<User, 'city'>>();

describe('query', () => {
  it('filters and sorts users in the allowed order', () => {
    const search = query(
      userWhere('name', 'John'),
      userWhere('surname', 'Doe'),
      userSort('age'),
    );

    expect(search(users)).toEqual([
      { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
      { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
      { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
    ]);
  });

  it('groups, filters groups and sorts them in the allowed order', () => {
    const groupedSearch = query(
      userWhere('surname', 'Doe'),
      userGroupBy('city'),
      userHaving<'city'>((group) => group.items.length > 1),
      groupSort('key'),
    );

    expect(groupedSearch(users)).toEqual([
      {
        key: 'LA',
        items: [
          { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
          { id: 4, name: 'Mike', surname: 'Doe', age: 35, city: 'LA' },
        ],
      },
      {
        key: 'NY',
        items: [
          { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
          { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
        ],
      },
    ]);
  });

  it('keeps the expected result types', () => {
    const search = query(
      userWhere('name', 'John'),
      userWhere('surname', 'Doe'),
      userSort('age'),
    );
    const groupedSearch = query(
      userGroupBy('city'),
      userHaving<'city'>((group) => group.items.length > 1),
      groupSort('key'),
    );

    expectTypeOf(search(users)).toEqualTypeOf<User[]>();
    expectTypeOf(groupedSearch(users)).toEqualTypeOf<Array<Group<User, 'city'>>>();
  });
});
