import { memo, useState, useRef, useEffect } from 'react';
import type { CellData } from '../../types';
import './Cell.css';

interface CellProps {
  cellKey: string;
  data: CellData | undefined;
  isActive: boolean;
  isInRange: boolean;
  width: number;
  height: number;
  onSelect: (key: string, shift: boolean) => void;
  onEdit: (key: string, value: string) => void;
  shouldEdit?: boolean;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
}

const Cell = memo(function Cell({
  cellKey,
  data,
  isActive,
  isInRange,
  width,
  height,
  onSelect,
  onEdit,
  shouldEdit = false,
  onStartEditing,
  onStopEditing,
}: CellProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const handledEditRequestRef = useRef(false);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (shouldEdit && !handledEditRequestRef.current && !editing) {
      setEditValue(data?.value ?? '');
      setEditing(true);
    }

    handledEditRequestRef.current = shouldEdit;
  }, [data?.value, editing, shouldEdit]);

  const startLocalEditing = () => {
    setEditValue(data?.value ?? '');
    setEditing(true);
    onStartEditing?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(cellKey, e.shiftKey);
  };

  const handleDoubleClick = () => {
    startLocalEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editing && e.key === 'Enter') {
      startLocalEditing();
      e.preventDefault();
    }
  };

  const commitEdit = () => {
    onEdit(cellKey, editValue);
    setEditing(false);
    onStopEditing?.();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
      onStopEditing?.();
    }
  };

  const formatDisplayValue = () => {
    const raw = data?.computed || data?.value || '';
    if (!data || raw === '') return raw;

    const number = Number(raw);
    if (data.format === 'number' && !Number.isNaN(number)) return String(number);
    if (data.format === 'percent' && !Number.isNaN(number)) return `${number * 100}%`;
    if (data.format === 'currency' && !Number.isNaN(number)) return `${number} руб.`;
    if (data.format === 'date') {
      const date = Number.isNaN(number) ? new Date(raw) : new Date(number);
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('ru-RU');
    }

    return raw;
  };

  const displayValue = formatDisplayValue();

  const cellStyle: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    height,
    fontWeight: data?.bold ? 'bold' : 'normal',
    fontStyle: data?.italic ? 'italic' : 'normal',
    textDecoration: data?.underline ? 'underline' : 'none',
    backgroundColor:
      isInRange && !data?.bgColor
        ? '#e0f2ff'
        : data?.bgColor && data.bgColor !== 'transparent'
          ? data.bgColor
          : undefined,
    color: data?.textColor || '#333',
    textAlign: data?.align || 'left',
  };

  const className = `cell${isActive ? ' cell--active' : ''}${isInRange ? ' cell--range' : ''}`;

  return (
    <td
      className={className}
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="cell__input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <span className="cell__text">{displayValue}</span>
      )}
    </td>
  );
});

export default Cell;
