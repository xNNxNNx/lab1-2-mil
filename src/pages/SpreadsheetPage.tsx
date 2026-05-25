import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { fetchDocument, saveDocument, setActiveDocument } from '../store/documentsSlice';
import type { SheetData } from '../types';
import { exportToCSV, exportToJSON, importCSV } from '../utils/csv';
import Table from '../components/Table/Table';
import FormattingToolbar from '../components/FormattingToolbar';
import SaveIndicator from '../components/SaveIndicator';
import RunawayButton from '../components/RunawayButton';
import useHotkeys from '../hooks/useHotkeys';
import './SpreadsheetPage.css';

export default function SpreadsheetPage() {
  useHotkeys();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: documentId } = useParams<{ id: string }>();
  const { cells, rows, cols, columnWidths, rowHeights } = useAppSelector((s) => s.spreadsheet);
  const activeDocument = useAppSelector((s) =>
    s.documents.list.find((doc) => doc.id === s.documents.activeDocumentId),
  );
  const user = useAppSelector((s) => s.auth.user);
  const saveStatus = useAppSelector((s) => s.ui.saveStatus);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef('');
  const loadedDocumentIdRef = useRef<string | null>(null);

  const makeSnapshot = useCallback(
    (nextCells: SheetData, nextRows: number, nextCols: number) =>
      JSON.stringify({ cells: nextCells, rows: nextRows, cols: nextCols }),
    [],
  );

  const saveNow = useCallback(async () => {
    if (!activeDocument || !user) return;

    const snapshot = makeSnapshot(cells, rows, cols);
    dispatch(setSaveStatus('saving'));

    const result = await dispatch(
      saveDocument({
        ...activeDocument,
        cells,
        rows,
        cols,
        userId: user.id,
      }),
    );

    if (saveDocument.fulfilled.match(result)) {
      lastSavedSnapshotRef.current = snapshot;
      dispatch(setSaveStatus('saved'));
    } else {
      dispatch(setSaveStatus('error'));
    }
  }, [activeDocument, cells, cols, dispatch, makeSnapshot, rows, user]);

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
    if (!documentId || !user) return;

    let cancelled = false;
    dispatch(fetchDocument({ id: documentId, userId: user.id })).then((result) => {
      if (cancelled) return;

      if (fetchDocument.fulfilled.match(result)) {
        const doc = result.payload;
        dispatch(loadSheet({ cells: doc.cells, rows: doc.rows, cols: doc.cols }));
        dispatch(setActiveDocument(doc.id));
        loadedDocumentIdRef.current = doc.id;
        lastSavedSnapshotRef.current = makeSnapshot(doc.cells, doc.rows, doc.cols);
        dispatch(setSaveStatus('saved'));
      } else {
        dispatch(setSaveStatus('error'));
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [dispatch, documentId, makeSnapshot, navigate, user]);

  useEffect(() => {
    if (!activeDocument || loadedDocumentIdRef.current !== activeDocument.id) return;

    const snapshot = makeSnapshot(cells, rows, cols);
    if (snapshot === lastSavedSnapshotRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    dispatch(setSaveStatus('saving'));

    saveTimerRef.current = setTimeout(() => {
      void saveNow();
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeDocument, cells, cols, dispatch, makeSnapshot, rows, saveNow]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        void saveNow();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [saveNow]);

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
    const json = exportToJSON({
      id: '',
      title: '',
      rows,
      cols,
      cells,
      createdAt: '',
      updatedAt: '',
      userId: '',
    });
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
        <RunawayButton className="btn-blue" onClick={handleExportCSV} maxRuns={3}>
          📥 Скачать CSV
        </RunawayButton>
        <RunawayButton className="btn-green" onClick={handleExportJSON} maxRuns={2}>
          📥 Скачать JSON
        </RunawayButton>
        <button className="btn-yellow" onClick={() => fileInputRef.current?.click()}>
          📤 Загрузить CSV
        </button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} hidden />
        <span className="export-label rotated-label wiggle">
          экспортируй данные куда хочешь! 🌍💫
        </span>
        <span className="sticker">🦄</span>
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
