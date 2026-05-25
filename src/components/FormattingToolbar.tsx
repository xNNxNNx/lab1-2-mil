import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCellFormat } from '../store/spreadsheetSlice';
import { getDefaultCell } from '../utils/cellHelpers';
import type { CellData } from '../types';
import './FormattingToolbar.css';

const COLORS = ['#000000', '#FF6B6B', '#FFD700', '#77DD77', '#00BFFF', '#9B59B6', '#FF9F43', '#FFFFFF'];
const BG_COLORS = ['transparent', '#FFF9C4', '#FFCDD2', '#C8E6C9', '#B3E5FC', '#E1BEE7', '#FFE0B2', '#F5F5F5'];

export default function FormattingToolbar() {
  const dispatch = useAppDispatch();
  const activeKey = useAppSelector((s) => s.spreadsheet.selection.active);
  const selectedRange = useAppSelector((s) => s.spreadsheet.selection.range);
  const cells = useAppSelector((s) => s.spreadsheet.cells);

  const getActiveCell = (): CellData => {
    if (!activeKey) return getDefaultCell();
    return cells[activeKey] ?? getDefaultCell();
  };

  const current = getActiveCell();

  const applyFormat = (format: Partial<CellData>) => {
    const keys = selectedRange && selectedRange.length > 0 ? selectedRange : activeKey ? [activeKey] : [];
    for (const key of keys) {
      dispatch(setCellFormat({ key, format }));
    }
  };

  return (
    <div className="formatting-toolbar">
      <button
        className={`ft-btn ${current.bold ? 'ft-btn--active' : ''}`}
        title="Жирный (Ctrl+B)"
        onClick={() => applyFormat({ bold: !current.bold })}
      >
        <b>B</b>
      </button>
      <button
        className={`ft-btn ${current.italic ? 'ft-btn--active' : ''}`}
        title="Курсив (Ctrl+I)"
        onClick={() => applyFormat({ italic: !current.italic })}
      >
        <i>I</i>
      </button>
      <button
        className={`ft-btn ${current.underline ? 'ft-btn--active' : ''}`}
        title="Подчёркнутый (Ctrl+U)"
        onClick={() => applyFormat({ underline: !current.underline })}
      >
        <u>U</u>
      </button>

      <span className="ft-sep">|</span>

      <button
        className={`ft-btn ${current.align === 'left' ? 'ft-btn--active' : ''}`}
        title="По левому краю"
        onClick={() => applyFormat({ align: 'left' })}
      >⬅️</button>
      <button
        className={`ft-btn ${current.align === 'center' ? 'ft-btn--active' : ''}`}
        title="По центру"
        onClick={() => applyFormat({ align: 'center' })}
      >↔️</button>
      <button
        className={`ft-btn ${current.align === 'right' ? 'ft-btn--active' : ''}`}
        title="По правому краю"
        onClick={() => applyFormat({ align: 'right' })}
      >➡️</button>

      <span className="ft-sep">|</span>

      <span className="ft-label">🎨 Цвет:</span>
      <span className="ft-colors">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`ft-color-swatch ${current.textColor === c ? 'ft-color-swatch--active' : ''}`}
            style={{ background: c, border: c === '#FFFFFF' ? '1px solid #ccc' : undefined }}
            title={`Цвет текста ${c}`}
            onClick={() => applyFormat({ textColor: c })}
          />
        ))}
      </span>

      <span className="ft-label">🖍️ Фон:</span>
      <span className="ft-colors">
        {BG_COLORS.map((c) => (
          <button
            key={c}
            className={`ft-color-swatch ${current.bgColor === c ? 'ft-color-swatch--active' : ''}`}
            style={{ background: c === 'transparent' ? '#fff' : c, border: '1px solid #ccc' }}
            title={`Фон ${c}`}
            onClick={() => applyFormat({ bgColor: c })}
          />
        ))}
      </span>

      <span className="ft-sep">|</span>

      <select
        className="ft-select"
        value={current.format}
        onChange={(e) => applyFormat({ format: e.target.value as CellData['format'] })}
        title="Формат ячейки"
      >
        <option value="text">📝 Текст</option>
        <option value="number">🔢 Число</option>
        <option value="percent">📊 Процент</option>
        <option value="currency">💰 Валюта</option>
        <option value="date">📅 Дата</option>
      </select>
    </div>
  );
}
