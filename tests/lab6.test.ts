import { describe, expectTypeOf, it } from 'vitest';

import type { DeepReadonly, EventHandlers, PickedByType } from '../src/lab6';

type State = {
  user: {
    id: number;
    name: string;
    tags: string[];
  };
  settings: {
    theme: 'light' | 'dark';
  };
  callback: () => string;
};

type ReadonlyState = {
  readonly user: {
    readonly id: number;
    readonly name: string;
    readonly tags: readonly string[];
  };
  readonly settings: {
    readonly theme: 'light' | 'dark';
  };
  readonly callback: () => string;
};

type Mixed = {
  id: number;
  name: string;
  active: boolean;
  score: number;
};

type NumberFields = {
  id: number;
  score: number;
};

type Events = {
  click: { x: number; y: number };
  focus: { id: string };
};

type Handlers = {
  onClick: (event: { x: number; y: number }) => void;
  onFocus: (event: { id: string }) => void;
};

describe('utility types', () => {
  it('builds DeepReadonly recursively', () => {
    expectTypeOf<DeepReadonly<State>>().toEqualTypeOf<ReadonlyState>();
  });

  it('picks fields by their type', () => {
    expectTypeOf<PickedByType<Mixed, number>>().toEqualTypeOf<NumberFields>();
  });

  it('builds event handlers from event names', () => {
    expectTypeOf<EventHandlers<Events>>().toEqualTypeOf<Handlers>();
  });
});
