import { describe, it, expect } from 'vitest';
import reducer, {
  setCellValue,
  setSelection,
  addRow,
  removeRow,
  undo,
  redo,
} from './spreadsheetSlice';

describe('spreadsheetSlice', () => {
  const getInitialState = () => reducer(undefined, { type: '@@INIT' });

  it('should return correct initial state', () => {
    const state = getInitialState();
    expect(state.cells).toEqual({});
    expect(state.rows).toBe(100);
    expect(state.cols).toBe(26);
    expect(state.selection).toEqual({ active: null, range: null });
    expect(state.history).toEqual([]);
    expect(state.future).toEqual([]);
  });

  it('setCellValue should add a cell with computed value', () => {
    const state = reducer(getInitialState(), setCellValue({ key: 'A1', value: '42' }));
    expect(state.cells['A1']).toBeDefined();
    expect(state.cells['A1'].value).toBe('42');
    expect(state.cells['A1'].computed).toBe('42');
  });

  it('undo should restore previous cells state', () => {
    let state = getInitialState();
    state = reducer(state, setCellValue({ key: 'A1', value: '10' }));
    state = reducer(state, setCellValue({ key: 'A1', value: '20' }));
    expect(state.cells['A1'].value).toBe('20');

    state = reducer(state, undo());
    expect(state.cells['A1'].value).toBe('10');
  });

  it('redo should restore future state', () => {
    let state = getInitialState();
    state = reducer(state, setCellValue({ key: 'A1', value: '10' }));
    state = reducer(state, setCellValue({ key: 'A1', value: '20' }));
    state = reducer(state, undo());
    expect(state.cells['A1'].value).toBe('10');

    state = reducer(state, redo());
    expect(state.cells['A1'].value).toBe('20');
  });

  it('addRow should increase rows by 1', () => {
    const state = reducer(getInitialState(), addRow(0));
    expect(state.rows).toBe(101);
  });

  it('removeRow should decrease rows by 1', () => {
    const state = reducer(getInitialState(), removeRow(0));
    expect(state.rows).toBe(99);
  });

  it('setSelection should update selection', () => {
    const selection = { active: 'B2', range: ['B2', 'B3'] };
    const state = reducer(getInitialState(), setSelection(selection));
    expect(state.selection).toEqual(selection);
  });

  it('history should not exceed 50 entries', () => {
    let state = getInitialState();
    for (let i = 0; i < 55; i++) {
      state = reducer(state, setCellValue({ key: 'A1', value: String(i) }));
    }
    expect(state.history.length).toBeLessThanOrEqual(50);
  });
});
