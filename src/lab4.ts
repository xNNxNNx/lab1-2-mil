export type Step<Input, Output> = (data: Input[]) => Output[];

export type Transform<T extends object> = Step<T, T>;

export type Where<T extends object> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

export type Sort<T extends object> = <K extends keyof T>(key: K) => Transform<T>;

export type Group<T extends object, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T extends object> = <K extends keyof T>(key: K) => Step<T, Group<T, K>>;

export type GroupTransform<T extends object, K extends keyof T> = Step<Group<T, K>, Group<T, K>>;

export type Having<T extends object> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean,
) => GroupTransform<T, K>;

type AnyStep = Step<any, any>;

export function where<T extends object>(): Where<T> {
  return (key, value) => (data) => data.filter((item) => item[key] === value);
}

export function sort<T extends object>(): Sort<T> {
  return (key) => (data) =>
    [...data].sort((left, right) => {
      const leftValue = left[key];
      const rightValue = right[key];

      if (leftValue < rightValue) {
        return -1;
      }

      if (leftValue > rightValue) {
        return 1;
      }

      return 0;
    });
}

export function groupBy<T extends object>(): GroupBy<T> {
  return (key) => (data) => {
    const groups = new Map<T[keyof T], T[]>();

    for (const item of data) {
      const groupKey = item[key];
      const items = groups.get(groupKey);

      if (items === undefined) {
        groups.set(groupKey, [item]);
      } else {
        items.push(item);
      }
    }

    return Array.from(groups, ([groupKey, items]) => ({
      key: groupKey as T[typeof key],
      items,
    }));
  };
}

export function having<T extends object>(): Having<T> {
  return <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) =>
    (groups: Array<Group<T, K>>) =>
      groups.filter((group) => predicate(group));
}

export function query<T extends object>(...steps: Transform<T>[]): Transform<T>;
export function query<T extends object, K extends keyof T>(
  groupStep: Step<T, Group<T, K>>,
  ...groupSteps: GroupTransform<T, K>[]
): Step<T, Group<T, K>>;
export function query<T extends object, K extends keyof T>(
  firstStep: Transform<T>,
  groupStep: Step<T, Group<T, K>>,
  ...groupSteps: GroupTransform<T, K>[]
): Step<T, Group<T, K>>;
export function query<T extends object, K extends keyof T>(
  firstStep: Transform<T>,
  secondStep: Transform<T>,
  groupStep: Step<T, Group<T, K>>,
  ...groupSteps: GroupTransform<T, K>[]
): Step<T, Group<T, K>>;
export function query<T extends object, K extends keyof T>(
  firstStep: Transform<T>,
  secondStep: Transform<T>,
  thirdStep: Transform<T>,
  groupStep: Step<T, Group<T, K>>,
  ...groupSteps: GroupTransform<T, K>[]
): Step<T, Group<T, K>>;
export function query<T extends object>(...steps: AnyStep[]) {
  return (data: T[]) =>
    steps.reduce<unknown[]>((result, step) => step(result), data) as unknown[];
}
