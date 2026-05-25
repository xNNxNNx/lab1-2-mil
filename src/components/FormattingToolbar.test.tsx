import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import spreadsheetReducer, { setSelection, setCellValue } from '../store/spreadsheetSlice';
import authReducer from '../store/authSlice';
import documentsReducer from '../store/documentsSlice';
import uiReducer from '../store/uiSlice';
import FormattingToolbar from './FormattingToolbar';

function createStore() {
  return configureStore({
    reducer: {
      spreadsheet: spreadsheetReducer,
      auth: authReducer,
      documents: documentsReducer,
      ui: uiReducer,
    },
  });
}

describe('FormattingToolbar', () => {
  it('renders B/I/U buttons', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FormattingToolbar />
      </Provider>,
    );
    expect(screen.getByTitle(/жирный/i)).toBeTruthy();
    expect(screen.getByTitle(/курсив/i)).toBeTruthy();
    expect(screen.getByTitle(/подчёркнутый/i)).toBeTruthy();
  });

  it('toggles bold on active cell', () => {
    const store = createStore();
    store.dispatch(setCellValue({ key: '0:0', value: 'hello' }));
    store.dispatch(setSelection({ active: '0:0', range: null }));

    render(
      <Provider store={store}>
        <FormattingToolbar />
      </Provider>,
    );

    const boldBtn = screen.getByTitle(/жирный/i);
    fireEvent.click(boldBtn);
    expect(store.getState().spreadsheet.cells['0:0'].bold).toBe(true);

    fireEvent.click(boldBtn);
    expect(store.getState().spreadsheet.cells['0:0'].bold).toBe(false);
  });

  it('renders format selector', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FormattingToolbar />
      </Provider>,
    );
    expect(screen.getByTitle(/формат ячейки/i)).toBeTruthy();
  });

  it('renders alignment buttons', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FormattingToolbar />
      </Provider>,
    );
    expect(screen.getByTitle(/по левому/i)).toBeTruthy();
    expect(screen.getByTitle(/по центру/i)).toBeTruthy();
    expect(screen.getByTitle(/по правому/i)).toBeTruthy();
  });
});
