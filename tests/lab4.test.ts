import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  groupBy,
  having,
  query,
  sort,
  where,
  type Group,
  type Transform,
} from '../src/lab4';

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
const userSort = sort<User>();
const userGroupBy = groupBy<User>();
const userHaving = having<User>();

describe('where', () => {
  it('filters items by key and value', () => {
    const result = userWhere('city', 'NY')(users);

    expect(result).toEqual([
      { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
      { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
    ]);
  });
});

describe('sort', () => {
  it('sorts items by key without mutating the source array', () => {
    const result = userSort('age')(users);

    expect(result).toEqual([
      { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
      { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
      { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
      { id: 4, name: 'Mike', surname: 'Doe', age: 35, city: 'LA' },
    ]);
    expect(users[0]?.id).toBe(1);
  });
});

describe('groupBy', () => {
  it('groups items by key', () => {
    const result = userGroupBy('city')(users);

    expect(result).toEqual([
      {
        key: 'NY',
        items: [
          { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
          { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
        ],
      },
      {
        key: 'LA',
        items: [
          { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
          { id: 4, name: 'Mike', surname: 'Doe', age: 35, city: 'LA' },
        ],
      },
    ]);
  });
});

describe('having', () => {
  it('filters groups by predicate', () => {
    const grouped = userGroupBy('city')(users);
    const result = userHaving<'city'>((group) => group.items.length > 1)(grouped);

    expect(result).toEqual(grouped);
  });
});

describe('query', () => {
  it('builds a pipeline with where and sort', () => {
    const search = query<User>(
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

  it('builds a pipeline with groupBy and having', () => {
    const groupedSearch = query(
      userGroupBy('city'),
      userHaving<'city'>((group) => group.items.length > 1),
    );

    expect(groupedSearch(users)).toEqual([
      {
        key: 'NY',
        items: [
          { id: 1, name: 'John', surname: 'Doe', age: 34, city: 'NY' },
          { id: 2, name: 'John', surname: 'Doe', age: 33, city: 'NY' },
        ],
      },
      {
        key: 'LA',
        items: [
          { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
          { id: 4, name: 'Mike', surname: 'Doe', age: 35, city: 'LA' },
        ],
      },
    ]);
  });

  it('builds a combined pipeline', () => {
    const pipeline = query(
      userWhere('surname', 'Doe'),
      userGroupBy('city'),
      userHaving<'city'>((group) => group.items.some((user) => user.age > 34)),
    );

    expect(pipeline(users)).toEqual([
      {
        key: 'LA',
        items: [
          { id: 3, name: 'John', surname: 'Doe', age: 35, city: 'LA' },
          { id: 4, name: 'Mike', surname: 'Doe', age: 35, city: 'LA' },
        ],
      },
    ]);
  });
});

describe('types', () => {
  it('keeps the expected types for operators and query', () => {
    const search = query<User>(
      userWhere('name', 'John'),
      userWhere('surname', 'Doe'),
      userSort('age'),
    );
    const groupedSearch = query(
      userGroupBy('city'),
      userHaving<'city'>((group) => group.items.length > 1),
    );

    expectTypeOf(userWhere('age', 34)).toEqualTypeOf<Transform<User>>();
    expectTypeOf(userGroupBy('city')(users)).toEqualTypeOf<Array<Group<User, 'city'>>>();
    expectTypeOf(search(users)).toEqualTypeOf<User[]>();
    expectTypeOf(groupedSearch(users)).toEqualTypeOf<Array<Group<User, 'city'>>>();
  });
});
