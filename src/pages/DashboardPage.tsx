import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDocuments, createDocument, deleteDocument, renameDocument, duplicateDocument } from '../store/documentsSlice';
import { openCreateModal, closeCreateModal } from '../store/uiSlice';
import DocumentCard from '../components/DocumentCard';
import CreateDocModal from '../components/CreateDocModal';
import './DashboardPage.css';

const MOCK_USER_ID = 'mock-user-id';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.documents);
  const showCreateModal = useAppSelector((s) => s.ui.showCreateModal);

  useEffect(() => {
    dispatch(fetchDocuments(MOCK_USER_ID));
  }, [dispatch]);

  const handleCreate = (title: string, rows: number, cols: number) => {
    dispatch(createDocument({ title, rows, cols, cells: {}, userId: MOCK_USER_ID }));
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title spider-title">Мои таблички 📋</h1>
      <p className="dashboard__subtitle">тут живут твои документы 🏠✨</p>

      <button className="btn-green dashboard__create" onClick={() => dispatch(openCreateModal())}>
        Создать новую табличку ➕
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
            onOpen={() => { /* will navigate later with router */ }}
            onRename={(title) => dispatch(renameDocument({ id: doc.id, title }))}
            onDuplicate={() => dispatch(duplicateDocument(doc.id))}
            onDelete={() => dispatch(deleteDocument(doc.id))}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateDocModal
          onClose={() => dispatch(closeCreateModal())}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
