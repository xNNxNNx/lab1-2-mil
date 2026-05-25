import './FormulaBar.css';

interface FormulaBarProps {
  activeCellKey: string | null;
  cellValue: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
}

export default function FormulaBar({
  activeCellKey,
  cellValue,
  onValueChange,
  onCommit,
}: FormulaBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommit();
    }
  };

  return (
    <div className="formula-bar">
      <div className="formula-bar__address">
        {activeCellKey || '—'}
      </div>
      <div className="formula-bar__fx">fx</div>
      <input
        className="formula-bar__input"
        value={cellValue}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={handleKeyDown}
        placeholder="Введи значение или формулу... 📝"
      />
    </div>
  );
}
