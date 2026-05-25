import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SheetData, Selection, ColumnWidths, RowHeights, CellKey, CellData } from '../types';
import { getDefaultCell, getCellKey, parseCellKey } from '../utils/cellHelpers';
import { evaluateFormula } from '../utils/formulas';

const MAX_HISTORY = 50;

interface SpreadsheetState {
  cells: SheetData;
  rows: number;
  cols: number;
  selection: Selection;
  columnWidths: ColumnWidths;
  rowHeights: RowHeights;
  history: SheetData[];
  future: SheetData[];
  isEditing: boolean;
  editingCell: CellKey | null;
}

const initialState: SpreadsheetState = {
  cells: {},
  rows: 100,
  cols: 26,
  selection: { active: null, range: null },
  columnWidths: {},
  rowHeights: {},
  history: [],
  future: [],
  isEditing: false,
  editingCell: null,
};

function cloneCells(cells: SheetData): SheetData {
  return JSON.parse(JSON.stringify(cells)) as SheetData;
}

function pushHistory(state: SpreadsheetState) {
  state.history.push(cloneCells(state.cells));
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.future = [];
}

function recalculateFormulas(cells: SheetData): SheetData {
  const nextCells = { ...cells };

  for (const [key, cell] of Object.entries(nextCells)) {
    if (cell.value.startsWith('=')) {
      nextCells[key] = { ...cell, computed: evaluateFormula(cell.value, nextCells) };
    }
  }

  return nextCells;
}

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    setCellValue(state, action: PayloadAction<{ key: CellKey; value: string }>) {
      const { key, value } = action.payload;
      pushHistory(state);

      const existing = state.cells[key] ?? getDefaultCell();
      const nextCells = { ...state.cells };
      nextCells[key] = { ...existing, value, computed: value };
      nextCells[key].computed = value.startsWith('=') ? evaluateFormula(value, nextCells) : value;
      state.cells = recalculateFormulas(nextCells);
    },

    setCellFormat(state, action: PayloadAction<{ key: CellKey; format: Partial<CellData> }>) {
      const { key, format } = action.payload;
      pushHistory(state);
      const existing = state.cells[key] ?? getDefaultCell();
      state.cells[key] = { ...existing, ...format };
    },

    setSelection(state, action: PayloadAction<Selection>) {
      state.selection = action.payload;
    },

    startEditing(state, action: PayloadAction<CellKey>) {
      state.isEditing = true;
      state.editingCell = action.payload;
    },

    stopEditing(state) {
      state.isEditing = false;
      state.editingCell = null;
    },

    addRow(state, action: PayloadAction<number>) {
      pushHistory(state);
      const insertAt = action.payload + 1;
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(state.cells)) {
        const parsed = parseCellKey(key);
        if (parsed.row >= insertAt) {
          newCells[getCellKey(parsed.row + 1, parsed.col)] = val;
        } else {
          newCells[key] = val;
        }
      }
      state.cells = recalculateFormulas(newCells);
      state.rows += 1;
    },

    removeRow(state, action: PayloadAction<number>) {
      pushHistory(state);
      const index = action.payload;
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(state.cells)) {
        const parsed = parseCellKey(key);
        if (parsed.row === index) continue;
        if (parsed.row > index) {
          newCells[getCellKey(parsed.row - 1, parsed.col)] = val;
        } else {
          newCells[key] = val;
        }
      }
      state.cells = recalculateFormulas(newCells);
      state.rows = Math.max(1, state.rows - 1);
    },

    addColumn(state, action: PayloadAction<number>) {
      pushHistory(state);
      const insertAt = action.payload + 1;
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(state.cells)) {
        const parsed = parseCellKey(key);
        if (parsed.col >= insertAt) {
          newCells[getCellKey(parsed.row, parsed.col + 1)] = val;
        } else {
          newCells[key] = val;
        }
      }
      state.cells = recalculateFormulas(newCells);
      state.cols += 1;
    },

    removeColumn(state, action: PayloadAction<number>) {
      pushHistory(state);
      const index = action.payload;
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(state.cells)) {
        const parsed = parseCellKey(key);
        if (parsed.col === index) continue;
        if (parsed.col > index) {
          newCells[getCellKey(parsed.row, parsed.col - 1)] = val;
        } else {
          newCells[key] = val;
        }
      }
      state.cells = recalculateFormulas(newCells);
      state.cols = Math.max(1, state.cols - 1);
    },

    setColumnWidth(state, action: PayloadAction<{ col: number; width: number }>) {
      state.columnWidths[action.payload.col] = action.payload.width;
    },

    setRowHeight(state, action: PayloadAction<{ row: number; height: number }>) {
      state.rowHeights[action.payload.row] = action.payload.height;
    },

    undo(state) {
      const prev = state.history.pop();
      if (prev) {
        state.future.push(cloneCells(state.cells));
        state.cells = prev;
      }
    },

    redo(state) {
      const next = state.future.pop();
      if (next) {
        state.history.push(cloneCells(state.cells));
        state.cells = next;
      }
    },

    loadSheet(state, action: PayloadAction<{ cells: SheetData; rows: number; cols: number }>) {
      state.cells = action.payload.cells;
      state.rows = action.payload.rows;
      state.cols = action.payload.cols;
      state.history = [];
      state.future = [];
      state.selection = { active: null, range: null };
    },
  },
});

export const {
  setCellValue,
  setCellFormat,
  setSelection,
  startEditing,
  stopEditing,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  setColumnWidth,
  setRowHeight,
  undo,
  redo,
  loadSheet,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;
