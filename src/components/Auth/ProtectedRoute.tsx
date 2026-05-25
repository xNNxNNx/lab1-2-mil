import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { restoreSession } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const [restoreChecked, setRestoreChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setRestoreChecked(true);
      return;
    }

    if (!loading && localStorage.getItem('refreshToken')) {
      dispatch(restoreSession()).finally(() => setRestoreChecked(true));
      return;
    }

    setRestoreChecked(true);
  }, [dispatch, isAuthenticated, loading]);

  if (loading || !restoreChecked) {
    return <div className="protected-route-loading">Загрузка... ⏳</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
