import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCellFormat, setCellValue, undo, redo } from '../store/spreadsheetSlice';
import { getDefaultCell } from '../utils/cellHelpers';

export default function useHotkeys() {
  const dispatch = useAppDispatch();
  const activeKey = useAppSelector((s) => s.spreadsheet.selection.active);
  const selectedRange = useAppSelector((s) => s.spreadsheet.selection.range);
  const cells = useAppSelector((s) => s.spreadsheet.cells);
  const isEditing = useAppSelector((s) => s.spreadsheet.isEditing);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditing) return;

      const keys = selectedRange && selectedRange.length > 0 ? selectedRange : activeKey ? [activeKey] : [];
      if (keys.length === 0 && !e.ctrlKey) return;

      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        const current = activeKey ? (cells[activeKey] ?? getDefaultCell()) : getDefaultCell();
        for (const key of keys) {
          dispatch(setCellFormat({ key, format: { bold: !current.bold } }));
        }
      }

      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        const current = activeKey ? (cells[activeKey] ?? getDefaultCell()) : getDefaultCell();
        for (const key of keys) {
          dispatch(setCellFormat({ key, format: { italic: !current.italic } }));
        }
      }

      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        const current = activeKey ? (cells[activeKey] ?? getDefaultCell()) : getDefaultCell();
        for (const key of keys) {
          dispatch(setCellFormat({ key, format: { underline: !current.underline } }));
        }
      }

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        dispatch(undo());
      }

      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        dispatch(redo());
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        for (const key of keys) {
          dispatch(setCellValue({ key, value: '' }));
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, activeKey, selectedRange, cells, isEditing]);
}
