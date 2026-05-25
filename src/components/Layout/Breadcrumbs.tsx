import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import './Breadcrumbs.css';

export default function Breadcrumbs() {
  const location = useLocation();
  const docList = useAppSelector((s) => s.documents.list);

  const crumbs: string[] = [];

  if (location.pathname.startsWith('/dashboard')) {
    crumbs.push('📋 Мои документы');
  } else if (location.pathname.startsWith('/documents/')) {
    const docId = location.pathname.split('/documents/')[1];
    const doc = docList.find((d) => d.id === docId);
    crumbs.push('📋 Мои документы');
    crumbs.push(doc?.title || 'Документ');
  } else if (location.pathname.startsWith('/profile')) {
    crumbs.push('👤 Профиль');
  }

  if (crumbs.length === 0) return null;

  return (
    <div className="breadcrumbs">
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {i > 0 && <span className="breadcrumbs__sep"> ➡️ </span>}
          <span className="breadcrumbs__item">{crumb}</span>
        </span>
      ))}
    </div>
  );
}
