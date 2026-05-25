import { useAppSelector } from '../store/hooks';
import './SaveIndicator.css';

export default function SaveIndicator() {
  const saveStatus = useAppSelector((s) => s.ui.saveStatus);

  if (saveStatus === 'idle') return null;

  const map = {
    saved: { text: '✅ Сохранено', className: 'save-indicator--saved' },
    saving: { text: '💾 Сохраняю...', className: 'save-indicator--saving' },
    error: { text: '❌ Ошибка сохранения', className: 'save-indicator--error' },
  } as const;

  const info = map[saveStatus];

  return <div className={`save-indicator ${info.className}`}>{info.text}</div>;
}
