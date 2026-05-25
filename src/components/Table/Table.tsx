import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { SheetData, ColumnWidths, RowHeights } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelection, startEditing, stopEditing } from '../../store/spreadsheetSlice';
import {
  colIndexToLetter,
  getCellKey,
  getDefaultCell,
  parseCellKey,
} from '../../utils/cellHelpers';
import { evaluateFormula } from '../../utils/formulas';
import Cell from './Cell';
import FormulaBar from './FormulaBar';
import ContextMenu from './ContextMenu';
import './Table.css';

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 32;
const RAINBOW = ['#FFD700', '#00BFFF', '#FF6B6B', '#77DD77'];
const ROW_EMOJIS: Record<number, string> = {
  10: '⭐',
  20: '🌟',
  30: '💫',
  40: '✨',
  50: '🎯',
  60: '🌈',
  70: '🎪',
  80: '🎨',
  90: '🎭',
  100: '🏆',
};

interface TableProps {
  rows: number;
  cols: number;
  cells: SheetData;
  onCellsChange: (cells: SheetData) => void;
  columnWidths: ColumnWidths;
  rowHeights: RowHeights;
  onColumnWidthChange: (col: number, width: number) => void;
  onRowHeightChange: (row: number, height: number) => void;
  onAddRow: (afterIndex: number) => void;
  onRemoveRow: (index: number) => void;
  onAddCol: (afterIndex: number) => void;
  onRemoveCol: (index: number) => void;
}

export default function Table({
  rows,
  cols,
  cells,
  onCellsChange,
  columnWidths,
  rowHeights,
  onColumnWidthChange,
  onRowHeightChange,
  onAddRow,
  onRemoveRow,
  onAddCol,
  onRemoveCol,
}: TableProps) {
  const dispatch = useAppDispatch();
  const selection = useAppSelector((s) => s.spreadsheet.selection);
  const editingCell = useAppSelector((s) => s.spreadsheet.editingCell);
  const activeCell = selection.active;
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    if (!activeCell) {
      setFormulaValue('');
      return;
    }

    setFormulaValue(cells[activeCell]?.value ?? '');
  }, [activeCell, cells]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!activeCell) return;
      const parsed = parseCellKey(activeCell);
      setContextMenu({ x: e.clientX, y: e.clientY, row: parsed.row, col: parsed.col });
    },
    [activeCell],
  );

  // Ресайз столбцов
  const resizingCol = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const handleColResizeStart = (col: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startW = columnWidths[col] ?? DEFAULT_COL_WIDTH;
    resizingCol.current = { col, startX: e.clientX, startW };

    const onMove = (ev: MouseEvent) => {
      if (!resizingCol.current) return;
      const diff = ev.clientX - resizingCol.current.startX;
      const newW = Math.max(50, resizingCol.current.startW + diff);
      onColumnWidthChange(resizingCol.current.col, newW);
    };
    const onUp = () => {
      resizingCol.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Ресайз строк
  const resizingRow = useRef<{ row: number; startY: number; startH: number } | null>(null);

  const handleRowResizeStart = (row: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startH = rowHeights[row] ?? DEFAULT_ROW_HEIGHT;
    resizingRow.current = { row, startY: e.clientY, startH };

    const onMove = (ev: MouseEvent) => {
      if (!resizingRow.current) return;
      const diff = ev.clientY - resizingRow.current.startY;
      const newH = Math.max(24, resizingRow.current.startH + diff);
      onRowHeightChange(resizingRow.current.row, newH);
    };
    const onUp = () => {
      resizingRow.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Виртуализация
  const visibleCount = Math.ceil(containerHeight / DEFAULT_ROW_HEIGHT) + 5;
  const startRow = Math.floor(scrollTop / DEFAULT_ROW_HEIGHT);
  const endRow = Math.min(startRow + visibleCount, rows);

  const topSpacer = startRow * DEFAULT_ROW_HEIGHT;
  const bottomSpacer = Math.max(0, (rows - endRow) * DEFAULT_ROW_HEIGHT);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      setContainerHeight(containerRef.current.clientHeight);
    }
  };

  const handleSelect = useCallback(
    (key: string, shift: boolean) => {
      if (shift && rangeStart) {
        // вычислить диапазон
        const s = parseCellKey(rangeStart);
        const e = parseCellKey(key);
        const keys: string[] = [];
        for (let r = Math.min(s.row, e.row); r <= Math.max(s.row, e.row); r++) {
          for (let c = Math.min(s.col, e.col); c <= Math.max(s.col, e.col); c++) {
            keys.push(getCellKey(r, c));
          }
        }
        dispatch(setSelection({ active: key, range: keys }));
      } else {
        setRangeStart(key);
        dispatch(setSelection({ active: key, range: null }));
      }
      const cell = cells[key];
      setFormulaValue(cell?.value ?? '');
    },
    [cells, dispatch, rangeStart],
  );

  const handleEdit = useCallback(
    (key: string, value: string) => {
      const newCells = { ...cells };
      const existing = cells[key] ?? getDefaultCell();
      const computed = value.startsWith('=') ? evaluateFormula(value, cells) : value;
      newCells[key] = { ...existing, value, computed };
      onCellsChange(newCells);
      setFormulaValue(value);
    },
    [cells, onCellsChange],
  );

  const handleFormulaCommit = useCallback(() => {
    if (activeCell) {
      handleEdit(activeCell, formulaValue);
    }
  }, [activeCell, formulaValue, handleEdit]);

  const rangeSet = useMemo(() => new Set(selection.range ?? []), [selection.range]);

  return (
    <div className="table-wrapper">
      <h2 className="table-title rotated-label">Табличка 📋</h2>
      <FormulaBar
        activeCellKey={activeCell}
        cellValue={formulaValue}
        onValueChange={setFormulaValue}
        onCommit={handleFormulaCommit}
      />
      <div
        className="table-container"
        ref={containerRef}
        onScroll={handleScroll}
        onContextMenu={handleContextMenu}
      >
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="header-corner">🕷️</th>
              {Array.from({ length: cols }, (_, c) => (
                <th
                  key={c}
                  className="header-col"
                  style={{
                    width: columnWidths[c] ?? DEFAULT_COL_WIDTH,
                    minWidth: columnWidths[c] ?? DEFAULT_COL_WIDTH,
                    backgroundColor: RAINBOW[c % RAINBOW.length],
                    color: '#fff',
                  }}
                >
                  {colIndexToLetter(c)}
                  <div className="col-resizer" onMouseDown={(e) => handleColResizeStart(c, e)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topSpacer > 0 && (
              <tr style={{ height: topSpacer }}>
                <td colSpan={cols + 1} />
              </tr>
            )}
            {Array.from({ length: endRow - startRow }, (_, i) => {
              const r = startRow + i;
              const rowNum = r + 1;
              const emoji = ROW_EMOJIS[rowNum] || '';
              const rh = rowHeights[r] ?? DEFAULT_ROW_HEIGHT;
              return (
                <tr key={r}>
                  <td className="header-row" style={{ height: rh }}>
                    {rowNum}
                    {emoji && ` ${emoji}`}
                    <div className="row-resizer" onMouseDown={(e) => handleRowResizeStart(r, e)} />
                  </td>
                  {Array.from({ length: cols }, (_, c) => {
                    const key = getCellKey(r, c);
                    return (
                      <Cell
                        key={key}
                        cellKey={key}
                        data={cells[key]}
                        isActive={activeCell === key}
                        isInRange={rangeSet.has(key)}
                        width={columnWidths[c] ?? DEFAULT_COL_WIDTH}
                        height={rh}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        shouldEdit={editingCell === key}
                        onStartEditing={() => dispatch(startEditing(key))}
                        onStopEditing={() => dispatch(stopEditing())}
                      />
                    );
                  })}
                </tr>
              );
            })}
            {bottomSpacer > 0 && (
              <tr style={{ height: bottomSpacer }}>
                <td colSpan={cols + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAddRowAbove={() => onAddRow(contextMenu.row - 1)}
          onAddRowBelow={() => onAddRow(contextMenu.row)}
          onDeleteRow={() => onRemoveRow(contextMenu.row)}
          onAddColLeft={() => onAddCol(contextMenu.col - 1)}
          onAddColRight={() => onAddCol(contextMenu.col)}
          onDeleteCol={() => onRemoveCol(contextMenu.col)}
        />
      )}
    </div>
  );
}
