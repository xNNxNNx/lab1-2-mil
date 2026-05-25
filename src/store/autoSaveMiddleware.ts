import type { Middleware } from '@reduxjs/toolkit';
import { setSaveStatus } from './uiSlice';

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    ['spreadsheet/setCellValue', 'spreadsheet/setCellFormat'].includes(
      (action as { type: string }).type,
    )
  ) {
    store.dispatch(setSaveStatus('saving'));
  }

  return result;
};
