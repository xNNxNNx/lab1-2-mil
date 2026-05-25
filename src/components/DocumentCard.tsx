import { useState } from 'react';
import type { SpreadsheetDocument } from '../types';
import { getCellKey } from '../utils/cellHelpers';
import './DocumentCard.css';

interface Props {
  doc: SpreadsheetDocument;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function DocumentCard({ doc, onOpen, onRename, onDuplicate, onDelete }: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(doc.title);

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
  };

  const preview = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => {
      const key = getCellKey(r, c);
      return doc.cells[key]?.computed || doc.cells[key]?.value || '';
    }),
  );

  return (
    <div className="doc-card">
      {isRenaming ? (
        <input
          className="doc-card__rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') setIsRenaming(false);
          }}
          autoFocus
        />
      ) : (
        <h3 className="doc-card__title">{doc.title}</h3>
      )}

      <div className="doc-card__dates">
        📅 Создан: {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
        <br />
        📅 Изменён: {new Date(doc.updatedAt).toLocaleDateString('ru-RU')}
      </div>

      <table className="doc-card__preview">
        <tbody>
          {preview.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) => (
                <td key={c}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="doc-card__actions">
        <button className="btn-blue" onClick={onOpen}>📂 Открыть</button>
        <button className="btn-yellow" onClick={() => { setRenameValue(doc.title); setIsRenaming(true); }}>✏️</button>
        <button className="btn-green" onClick={onDuplicate}>📋</button>
        <button className="btn-red" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
}
