import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
  renameDocument,
  duplicateDocument,
} from '../store/documentsSlice';
import { openCreateModal, closeCreateModal } from '../store/uiSlice';
import DocumentCard from '../components/DocumentCard';
import CreateDocModal from '../components/CreateDocModal';
import './DashboardPage.css';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, loading } = useAppSelector((s) => s.documents);
  const showCreateModal = useAppSelector((s) => s.ui.showCreateModal);
  const userId = useAppSelector((s) => s.auth.user?.id ?? 'mock-user-id');

  useEffect(() => {
    dispatch(fetchDocuments(userId));
  }, [dispatch, userId]);

  const handleCreate = (title: string, rows: number, cols: number) => {
    dispatch(createDocument({ title, rows, cols, cells: {}, userId }));
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title spider-title">Мои таблички 📋</h1>
      <p className="dashboard__subtitle">тут живут твои документы 🏠✨</p>
      <div className="dashboard__stickers">
        <span className="float-emoji">🌈</span>{' '}
        <span className="float-emoji" style={{ animationDelay: '0.5s' }}>⭐</span>{' '}
        <span className="float-emoji" style={{ animationDelay: '1s' }}>🎈</span>{' '}
        <span className="float-emoji" style={{ animationDelay: '1.5s' }}>🦋</span>{' '}
        <span className="float-emoji" style={{ animationDelay: '2s' }}>🍭</span>
      </div>

      <button className="btn-green dashboard__create" onClick={() => dispatch(openCreateModal())}>
        Создать новую табличку ➕🎉
      </button>

      {loading && <p className="dashboard__loading">Загрузка... ⏳</p>}

      {!loading && list.length === 0 && (
        <p className="dashboard__empty">Пока пусто... Создай свою первую табличку! 🌈</p>
      )}

      <div className="dashboard__grid">
        {list.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            onOpen={() => navigate(`/documents/${doc.id}`)}
            onRename={(title) => dispatch(renameDocument({ id: doc.id, title }))}
            onDuplicate={() => dispatch(duplicateDocument(doc.id))}
            onDelete={() => dispatch(deleteDocument(doc.id))}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateDocModal onClose={() => dispatch(closeCreateModal())} onCreate={handleCreate} />
      )}
    </div>
  );
}
