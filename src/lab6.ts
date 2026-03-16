export type DeepReadonly<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer Item)[]
      ? readonly DeepReadonly<Item>[]
      : T extends object
        ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
        : T;

export type PickedByType<T, U> = {
  [Key in keyof T as T[Key] extends U ? Key : never]: T[Key];
};

export type EventHandlers<T> = {
  [Key in keyof T as Key extends string ? `on${Capitalize<Key>}` : never]: (
    event: T[Key],
  ) => void;
};
