import { useEffect, useRef } from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onDeleteRow: () => void;
  onAddColLeft: () => void;
  onAddColRight: () => void;
  onDeleteCol: () => void;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onAddRowAbove,
  onAddRowBelow,
  onDeleteRow,
  onAddColLeft,
  onAddColRight,
  onDeleteCol,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const items = [
    { label: '➕ Добавить строку сверху', action: onAddRowAbove },
    { label: '➕ Добавить строку снизу', action: onAddRowBelow },
    { label: '❌ Удалить строку', action: onDeleteRow },
    { label: '➕ Добавить столбец слева', action: onAddColLeft },
    { label: '➕ Добавить столбец справа', action: onAddColRight },
    { label: '❌ Удалить столбец', action: onDeleteCol },
  ];

  return (
    <div className="context-menu" style={{ left: x, top: y }} ref={menuRef}>
      {items.map((item) => (
        <button
          key={item.label}
          className="context-menu__item"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
      <div className="context-menu__footer">выбирай с умом! 🧠✨</div>
    </div>
  );
}
