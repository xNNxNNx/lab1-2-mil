import { useState, useCallback } from 'react';
import type { SheetData, ColumnWidths, RowHeights } from './types';
import Table from './components/Table/Table';
import './App.css';

const INITIAL_ROWS = 100;
const INITIAL_COLS = 26;

function App() {
  const [cells, setCells] = useState<SheetData>({});
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [rowHeights, setRowHeights] = useState<RowHeights>({});

  const handleColumnWidthChange = useCallback((col: number, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [col]: width }));
  }, []);

  const handleRowHeightChange = useCallback((row: number, height: number) => {
    setRowHeights((prev) => ({ ...prev, [row]: height }));
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Table
        rows={INITIAL_ROWS}
        cols={INITIAL_COLS}
        cells={cells}
        onCellsChange={setCells}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        onColumnWidthChange={handleColumnWidthChange}
        onRowHeightChange={handleRowHeightChange}
      />
    </div>
  );
}

export default App;
