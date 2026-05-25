import { useState, useEffect } from 'react';
import './CreateDocModal.css';

interface Props {
  onClose: () => void;
  onCreate: (title: string, rows: number, cols: number) => void;
}

export default function CreateDocModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(26);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate(title.trim(), rows, cols);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Новая табличка 🆕✨</h2>
        <div className="modal-field">
          <label>Название</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Придумай имя... 💭"
            autoFocus
          />
        </div>
        <div className="modal-row">
          <div className="modal-field">
            <label>Строки</label>
            <input type="number" value={rows} onChange={(e) => setRows(+e.target.value)} min={1} />
          </div>
          <div className="modal-field">
            <label>Столбцы</label>
            <input type="number" value={cols} onChange={(e) => setCols(+e.target.value)} min={1} max={26} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-green" onClick={handleSubmit}>Создать! 🚀</button>
          <button style={{ background: '#ccc', color: '#333' }} onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
