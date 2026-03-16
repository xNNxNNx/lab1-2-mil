import type { DeepReadonly, EventHandlers } from '../src/lab6';

type State = {
  user: {
    id: number;
    name: string;
    tags: string[];
  };
};

type Events = {
  click: { x: number; y: number };
  focus: { id: string };
};

declare const readonlyState: DeepReadonly<State>;
declare const handlers: EventHandlers<Events>;

// @ts-expect-error
readonlyState.user.name = 'Mike';

// @ts-expect-error
readonlyState.user.tags.push('new');

handlers.onClick({ x: 10, y: 15 });
handlers.onFocus({ id: 'field-1' });

// @ts-expect-error
handlers.onBlur({ id: 'field-1' });
