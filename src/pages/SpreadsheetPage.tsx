import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCellValue,
  addRow,
  removeRow,
  addColumn,
  removeColumn,
  setColumnWidth,
  setRowHeight,
  loadSheet,
} from '../store/spreadsheetSlice';
import { setSaveStatus } from '../store/uiSlice';
import type { SheetData } from '../types';
import { exportToCSV, exportToJSON, importCSV } from '../utils/csv';
import Table from '../components/Table/Table';
import FormattingToolbar from '../components/FormattingToolbar';
import SaveIndicator from '../components/SaveIndicator';
import './SpreadsheetPage.css';

export default function SpreadsheetPage() {
  const dispatch = useAppDispatch();
  const { cells, rows, cols, columnWidths, rowHeights } = useAppSelector((s) => s.spreadsheet);
  const saveStatus = useAppSelector((s) => s.ui.saveStatus);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        dispatch(setSaveStatus('saved'));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

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

  const handleExportCSV = () => {
    const csv = exportToCSV(cells, rows, cols);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'таблица.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportToJSON({ id: '', title: '', rows, cols, cells, createdAt: '', updatedAt: '', userId: '' });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'таблица.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importCSV(text);
      dispatch(loadSheet(result));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="spreadsheet-page">
      <div className="export-bar">
        <button className="btn-blue" onClick={handleExportCSV}>📥 Скачать CSV</button>
        <button className="btn-green" onClick={handleExportJSON}>📥 Скачать JSON</button>
        <button className="btn-yellow" onClick={() => fileInputRef.current?.click()}>📤 Загрузить CSV</button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} hidden />
        <span className="export-label rotated-label">экспортируй данные куда хочешь! 🌍💫</span>
      </div>
      <FormattingToolbar />
      <SaveIndicator />
      <Table
        rows={rows}
        cols={cols}
        cells={cells}
        onCellsChange={handleCellsChange}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        onColumnWidthChange={(col, width) => dispatch(setColumnWidth({ col, width }))}
        onRowHeightChange={(row, height) => dispatch(setRowHeight({ row, height }))}
        onAddRow={(i) => dispatch(addRow(i))}
        onRemoveRow={(i) => dispatch(removeRow(i))}
        onAddCol={(i) => dispatch(addColumn(i))}
        onRemoveCol={(i) => dispatch(removeColumn(i))}
      />
    </div>
  );
}
