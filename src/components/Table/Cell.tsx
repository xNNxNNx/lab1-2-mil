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
}: CellProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleClick = (e: React.MouseEvent) => {
    onSelect(cellKey, e.shiftKey);
  };

  const handleDoubleClick = () => {
    setEditValue(data?.value ?? '');
    setEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editing && e.key === 'Enter') {
      setEditValue(data?.value ?? '');
      setEditing(true);
      e.preventDefault();
    }
  };

  const commitEdit = () => {
    onEdit(cellKey, editValue);
    setEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  const displayValue = data?.computed || data?.value || '';

  const cellStyle: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    height,
    fontWeight: data?.bold ? 'bold' : 'normal',
    fontStyle: data?.italic ? 'italic' : 'normal',
    textDecoration: data?.underline ? 'underline' : 'none',
    backgroundColor: isInRange && !data?.bgColor ? '#e0f2ff' : (data?.bgColor && data.bgColor !== 'transparent' ? data.bgColor : undefined),
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
