import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCellFormat,
  setCellValue,
  setSelection,
  startEditing,
  stopEditing,
  undo,
  redo,
} from '../store/spreadsheetSlice';
import { getCellKey, getDefaultCell, parseCellKey } from '../utils/cellHelpers';
import type { CellData, CellKey } from '../types';

interface ClipboardData {
  origin: CellKey;
  cells: Record<CellKey, CellData>;
}

export default function useHotkeys() {
  const dispatch = useAppDispatch();
  const activeKey = useAppSelector((s) => s.spreadsheet.selection.active);
  const selectedRange = useAppSelector((s) => s.spreadsheet.selection.range);
  const cells = useAppSelector((s) => s.spreadsheet.cells);
  const isEditing = useAppSelector((s) => s.spreadsheet.isEditing);
  const rows = useAppSelector((s) => s.spreadsheet.rows);
  const cols = useAppSelector((s) => s.spreadsheet.cols);

  const clipboardRef = useRef<ClipboardData | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyName = e.key.toLowerCase();
      const target = e.target as HTMLElement | null;

      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      if (isEditing) {
        if (keyName === 'escape') {
          dispatch(stopEditing());
        }
        return;
      }

      const keys =
        selectedRange && selectedRange.length > 0 ? selectedRange : activeKey ? [activeKey] : [];

      if (e.ctrlKey && keyName === 'z' && e.shiftKey) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      if (e.ctrlKey && keyName === 'z') {
        e.preventDefault();
        dispatch(undo());
        return;
      }

      if (e.ctrlKey && keyName === 'y') {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      if (e.ctrlKey && keyName === 'a') {
        e.preventDefault();
        const allKeys: CellKey[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            allKeys.push(getCellKey(r, c));
          }
        }
        dispatch(setSelection({ active: activeKey ?? 'A1', range: allKeys }));
        return;
      }

      if (keys.length === 0) return;

      if (e.ctrlKey && keyName === 'b') {
        e.preventDefault();
        const current = activeKey ? (cells[activeKey] ?? getDefaultCell()) : getDefaultCell();
        for (const key of keys) {
          dispatch(setCellFormat({ key, format: { bold: !current.bold } }));
        }
        return;
      }

      if (e.ctrlKey && keyName === 'i') {
        e.preventDefault();
        const current = activeKey ? (cells[activeKey] ?? getDefaultCell()) : getDefaultCell();
        for (const key of keys) {
          dispatch(setCellFormat({ key, format: { italic: !current.italic } }));
        }
        return;
      }

      if (e.ctrlKey && keyName === 'u') {
        e.preventDefault();
        const current = activeKey ? (cells[activeKey] ?? getDefaultCell()) : getDefaultCell();
        for (const key of keys) {
          dispatch(setCellFormat({ key, format: { underline: !current.underline } }));
        }
        return;
      }

      if (e.ctrlKey && keyName === 'c') {
        e.preventDefault();
        const copiedCells: Record<CellKey, CellData> = {};
        for (const key of keys) {
          copiedCells[key] = { ...(cells[key] ?? getDefaultCell()) };
        }
        clipboardRef.current = { origin: activeKey ?? keys[0], cells: copiedCells };
        return;
      }

      if (e.ctrlKey && keyName === 'x') {
        e.preventDefault();
        const copiedCells: Record<CellKey, CellData> = {};
        for (const key of keys) {
          copiedCells[key] = { ...(cells[key] ?? getDefaultCell()) };
          dispatch(setCellValue({ key, value: '' }));
        }
        clipboardRef.current = { origin: activeKey ?? keys[0], cells: copiedCells };
        return;
      }

      if (e.ctrlKey && keyName === 'v' && activeKey && clipboardRef.current) {
        e.preventDefault();
        const origin = parseCellKey(clipboardRef.current.origin);
        const target = parseCellKey(activeKey);
        const rowOffset = target.row - origin.row;
        const colOffset = target.col - origin.col;

        for (const [sourceKey, cell] of Object.entries(clipboardRef.current.cells)) {
          const source = parseCellKey(sourceKey);
          const targetRow = source.row + rowOffset;
          const targetCol = source.col + colOffset;
          if (targetRow < 0 || targetCol < 0 || targetRow >= rows || targetCol >= cols) continue;

          const targetKey = getCellKey(targetRow, targetCol);
          dispatch(setCellValue({ key: targetKey, value: cell.value }));
          dispatch(
            setCellFormat({
              key: targetKey,
              format: {
                bold: cell.bold,
                italic: cell.italic,
                underline: cell.underline,
                bgColor: cell.bgColor,
                textColor: cell.textColor,
                align: cell.align,
                format: cell.format,
              },
            }),
          );
        }
        return;
      }

      if (keyName === 'delete' || keyName === 'backspace') {
        e.preventDefault();
        for (const key of keys) {
          dispatch(setCellValue({ key, value: '' }));
        }
        return;
      }

      if (keyName === 'enter' && activeKey) {
        e.preventDefault();
        dispatch(startEditing(activeKey));
        return;
      }

      if (keyName === 'tab' && activeKey) {
        e.preventDefault();
        const current = parseCellKey(activeKey);
        const nextCol = e.shiftKey
          ? Math.max(0, current.col - 1)
          : Math.min(cols - 1, current.col + 1);
        dispatch(setSelection({ active: getCellKey(current.row, nextCol), range: null }));
        return;
      }

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(keyName) && activeKey) {
        e.preventDefault();
        const current = parseCellKey(activeKey);
        const next = {
          row:
            keyName === 'arrowup'
              ? Math.max(0, current.row - 1)
              : keyName === 'arrowdown'
                ? Math.min(rows - 1, current.row + 1)
                : current.row,
          col:
            keyName === 'arrowleft'
              ? Math.max(0, current.col - 1)
              : keyName === 'arrowright'
                ? Math.min(cols - 1, current.col + 1)
                : current.col,
        };
        dispatch(setSelection({ active: getCellKey(next.row, next.col), range: null }));
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, activeKey, selectedRange, cells, isEditing, rows, cols, clipboardRef]);
}
