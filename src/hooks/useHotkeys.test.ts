import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import spreadsheetReducer, { setCellValue, setSelection } from '../store/spreadsheetSlice';

describe('hotkeys logic (unit)', () => {
  it('undo restores previous state', () => {
    const store = configureStore({ reducer: { spreadsheet: spreadsheetReducer } });
    store.dispatch(setCellValue({ key: '0:0', value: 'a' }));
    store.dispatch(setCellValue({ key: '0:0', value: 'b' }));

    expect(store.getState().spreadsheet.cells['0:0'].value).toBe('b');

    store.dispatch({ type: 'spreadsheet/undo' });
    expect(store.getState().spreadsheet.cells['0:0'].value).toBe('a');
  });

  it('redo restores undone state', () => {
    const store = configureStore({ reducer: { spreadsheet: spreadsheetReducer } });
    store.dispatch(setCellValue({ key: '0:0', value: 'a' }));
    store.dispatch(setCellValue({ key: '0:0', value: 'b' }));
    store.dispatch({ type: 'spreadsheet/undo' });
    store.dispatch({ type: 'spreadsheet/redo' });

    expect(store.getState().spreadsheet.cells['0:0'].value).toBe('b');
  });

  it('setCellFormat applies bold', () => {
    const store = configureStore({ reducer: { spreadsheet: spreadsheetReducer } });
    store.dispatch(setCellValue({ key: '0:0', value: 'test' }));
    store.dispatch({
      type: 'spreadsheet/setCellFormat',
      payload: { key: '0:0', format: { bold: true } },
    });

    expect(store.getState().spreadsheet.cells['0:0'].bold).toBe(true);
  });

  it('Delete clears cell value', () => {
    const store = configureStore({ reducer: { spreadsheet: spreadsheetReducer } });
    store.dispatch(setCellValue({ key: '0:0', value: 'hello' }));
    store.dispatch(setSelection({ active: '0:0', range: ['0:0'] }));
    store.dispatch(setCellValue({ key: '0:0', value: '' }));

    expect(store.getState().spreadsheet.cells['0:0'].value).toBe('');
  });
});
