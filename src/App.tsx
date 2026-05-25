import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  setCellValue,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  setColumnWidth,
  setRowHeight,
} from './store/spreadsheetSlice';
import type { SheetData } from './types';
import Table from './components/Table/Table';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { cells, rows, cols, columnWidths, rowHeights } = useAppSelector(
    (s) => s.spreadsheet,
  );

  const handleCellsChange = useCallback(
    (newCells: SheetData) => {
      for (const [key, cell] of Object.entries(newCells)) {
        if (!cells[key] || cells[key].value !== cell.value) {
          dispatch(setCellValue({ key, value: cell.value }));
        }
      }
    },
    [cells, dispatch],
  );

  const handleColumnWidthChange = useCallback(
    (col: number, width: number) => dispatch(setColumnWidth({ col, width })),
    [dispatch],
  );

  const handleRowHeightChange = useCallback(
    (row: number, height: number) => dispatch(setRowHeight({ row, height })),
    [dispatch],
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Table
        rows={rows}
        cols={cols}
        cells={cells}
        onCellsChange={handleCellsChange}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        onColumnWidthChange={handleColumnWidthChange}
        onRowHeightChange={handleRowHeightChange}
        onAddRow={(afterIndex) => dispatch(addRow(afterIndex))}
        onRemoveRow={(index) => dispatch(removeRow(index))}
        onAddCol={(afterIndex) => dispatch(addColumn(afterIndex))}
        onRemoveCol={(index) => dispatch(removeColumn(index))}
      />
    </div>
  );
}

export default App;
