import { useState, useCallback } from 'react';
import type { SheetData, ColumnWidths, RowHeights } from './types';
import { getCellKey, parseCellKey } from './utils/cellHelpers';
import Table from './components/Table/Table';
import './App.css';

function App() {
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(26);
  const [cells, setCells] = useState<SheetData>({});
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [rowHeights, setRowHeights] = useState<RowHeights>({});

  const handleColumnWidthChange = useCallback((col: number, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [col]: width }));
  }, []);

  const handleRowHeightChange = useCallback((row: number, height: number) => {
    setRowHeights((prev) => ({ ...prev, [row]: height }));
  }, []);

  const handleAddRow = useCallback((afterIndex: number) => {
    const insertAt = afterIndex + 1;
    setCells((prev) => {
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(prev)) {
        const parsed = parseCellKey(key);
        if (parsed.row >= insertAt) {
          newCells[getCellKey(parsed.row + 1, parsed.col)] = val;
        } else {
          newCells[key] = val;
        }
      }
      return newCells;
    });
    setRows((r) => r + 1);
  }, []);

  const handleRemoveRow = useCallback((index: number) => {
    setCells((prev) => {
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(prev)) {
        const parsed = parseCellKey(key);
        if (parsed.row === index) continue;
        if (parsed.row > index) {
          newCells[getCellKey(parsed.row - 1, parsed.col)] = val;
        } else {
          newCells[key] = val;
        }
      }
      return newCells;
    });
    setRows((r) => Math.max(1, r - 1));
  }, []);

  const handleAddCol = useCallback((afterIndex: number) => {
    const insertAt = afterIndex + 1;
    setCells((prev) => {
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(prev)) {
        const parsed = parseCellKey(key);
        if (parsed.col >= insertAt) {
          newCells[getCellKey(parsed.row, parsed.col + 1)] = val;
        } else {
          newCells[key] = val;
        }
      }
      return newCells;
    });
    setCols((c) => c + 1);
  }, []);

  const handleRemoveCol = useCallback((index: number) => {
    setCells((prev) => {
      const newCells: SheetData = {};
      for (const [key, val] of Object.entries(prev)) {
        const parsed = parseCellKey(key);
        if (parsed.col === index) continue;
        if (parsed.col > index) {
          newCells[getCellKey(parsed.row, parsed.col - 1)] = val;
        } else {
          newCells[key] = val;
        }
      }
      return newCells;
    });
    setCols((c) => Math.max(1, c - 1));
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Table
        rows={rows}
        cols={cols}
        cells={cells}
        onCellsChange={setCells}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        onColumnWidthChange={handleColumnWidthChange}
        onRowHeightChange={handleRowHeightChange}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onAddCol={handleAddCol}
        onRemoveCol={handleRemoveCol}
      />
    </div>
  );
}

export default App;
