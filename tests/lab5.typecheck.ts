import { groupBy, having, query, sort, where, type Group } from '../src/lab5';

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const userWhere = where<User>();
const userGroupBy = groupBy<User>();
const userHaving = having<User>();
const userSort = sort<User>();
const groupSort = sort<Group<User, 'city'>>();

query(userWhere('name', 'John'), userWhere('surname', 'Doe'), userSort('age'));
query(userGroupBy('city'), userHaving<'city'>((group) => group.items.length > 1), groupSort('key'));

// @ts-expect-error
query(userSort('age'), userWhere('name', 'John'));

// @ts-expect-error
query(userHaving<'city'>((group) => group.items.length > 1));

// @ts-expect-error
query(userGroupBy('city'), userWhere('name', 'John'));

// @ts-expect-error
query(userGroupBy('city'), groupSort('key'), userHaving<'city'>((group) => group.items.length > 1));
