export type Step<Input, Output> = (data: Input[]) => Output[];

export type Group<T extends object, K extends keyof T> = {
  key: T[K];
  items: T[];
};

type OperationKind = 'where' | 'groupBy' | 'having' | 'sort';

type Operation<Kind extends OperationKind, Input extends object, Output extends object> = Step<
  Input,
  Output
> & {
  readonly kind: Kind;
};

export type WhereStep<T extends object> = Operation<'where', T, T>;

export type GroupByStep<T extends object, K extends keyof T> = Operation<'groupBy', T, Group<T, K>>;

export type HavingStep<T extends object, K extends keyof T> = Operation<
  'having',
  Group<T, K>,
  Group<T, K>
>;

export type SortStep<T extends object> = Operation<'sort', T, T>;

export type Where<T extends object> = <K extends keyof T>(key: K, value: T[K]) => WhereStep<T>;

export type GroupBy<T extends object> = <K extends keyof T>(key: K) => GroupByStep<T, K>;

export type Having<T extends object> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean,
) => HavingStep<T, K>;

export type Sort<T extends object> = <K extends keyof T>(key: K) => SortStep<T>;

type AnyOperation = Operation<OperationKind, any, any>;

type InputOf<TOperation extends AnyOperation> =
  TOperation extends Operation<OperationKind, infer Input, any> ? Input : never;

type OutputOf<TOperation extends AnyOperation> =
  TOperation extends Operation<OperationKind, any, infer Output> ? Output : never;

type KindOf<TOperation extends AnyOperation> = TOperation['kind'];

type Phase = 'start' | OperationKind;

type NextPhase<TPhase extends Phase, TKind extends OperationKind> =
  TPhase extends 'start'
    ? TKind extends 'where'
      ? 'where'
      : TKind extends 'groupBy'
        ? 'groupBy'
        : TKind extends 'sort'
          ? 'sort'
          : never
    : TPhase extends 'where'
      ? TKind extends 'where'
        ? 'where'
        : TKind extends 'groupBy'
          ? 'groupBy'
          : TKind extends 'sort'
            ? 'sort'
            : never
      : TPhase extends 'groupBy'
        ? TKind extends 'having'
          ? 'having'
          : TKind extends 'sort'
            ? 'sort'
            : never
        : TPhase extends 'having'
          ? TKind extends 'having'
            ? 'having'
            : TKind extends 'sort'
              ? 'sort'
              : never
          : TPhase extends 'sort'
            ? TKind extends 'sort'
              ? 'sort'
              : never
            : never;

type ValidatePipeline<
  TCurrent extends object,
  TOperations extends readonly AnyOperation[],
  TPhase extends Phase = 'start',
> = TOperations extends readonly []
  ? []
  : TOperations extends readonly [
        infer First extends AnyOperation,
        ...infer Rest extends AnyOperation[],
      ]
    ? [TCurrent] extends [InputOf<First>]
      ? NextPhase<TPhase, KindOf<First>> extends never
        ? never
        : NextPhase<TPhase, KindOf<First>> extends infer Next extends Phase
          ? [First, ...ValidatePipeline<OutputOf<First>, Rest, Next>]
          : never
      : never
    : never;

type QueryInput<TOperations extends readonly [AnyOperation, ...AnyOperation[]]> = InputOf<
  TOperations[0]
>;

type QueryOutput<TOperations extends readonly AnyOperation[]> = TOperations extends readonly [
  ...AnyOperation[],
  infer Last extends AnyOperation,
]
  ? OutputOf<Last>
  : never;

function createOperation<Kind extends OperationKind, Input extends object, Output extends object>(
  kind: Kind,
  operation: Step<Input, Output>,
): Operation<Kind, Input, Output> {
  return Object.assign(operation, { kind });
}

export function where<T extends object>(): Where<T> {
  return (key, value) =>
    createOperation('where', (data: T[]) => data.filter((item) => item[key] === value));
}

export function groupBy<T extends object>(): GroupBy<T> {
  return (key) =>
    createOperation('groupBy', (data: T[]) => {
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
    });
}

export function having<T extends object>(): Having<T> {
  return <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) =>
    createOperation('having', (groups: Array<Group<T, K>>) =>
      groups.filter((group) => predicate(group)),
    );
}

export function sort<T extends object>(): Sort<T> {
  return (key) =>
    createOperation('sort', (data: T[]) =>
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
      }),
    );
}

export function query<const TOperations extends readonly [AnyOperation, ...AnyOperation[]]>(
  ...operations: TOperations & ValidatePipeline<QueryInput<TOperations>, TOperations>
): Step<QueryInput<TOperations>, QueryOutput<TOperations>>;
export function query(...operations: AnyOperation[]) {
  return (data: object[]) =>
    operations.reduce<object[]>((result, operation) => operation(result), data);
}
