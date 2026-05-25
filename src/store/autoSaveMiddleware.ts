import type { Middleware } from '@reduxjs/toolkit';
import { setSaveStatus } from './uiSlice';

let timer: ReturnType<typeof setTimeout> | null = null;

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    (action as { type: string }).type === 'spreadsheet/setCellValue'
  ) {
    if (timer) clearTimeout(timer);

    store.dispatch(setSaveStatus('saving'));

    timer = setTimeout(() => {
      store.dispatch(setSaveStatus('saved'));
    }, 500);
  }

  return result;
};
