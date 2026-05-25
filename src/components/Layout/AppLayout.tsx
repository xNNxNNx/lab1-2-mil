import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/authSlice';
import RunawayButton from '../RunawayButton';
import Breadcrumbs from './Breadcrumbs';
import './AppLayout.css';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-logo spider-title wiggle">🕷️ Табличкин</h1>
        <nav className="app-nav">
          <NavLink to="/dashboard" className="app-nav__link">
            📋 Мои таблички
          </NavLink>
          <NavLink to="/profile" className="app-nav__link">
            👤 Профиль
          </NavLink>
        </nav>
        <div className="app-header__user">
          <span className="float-emoji">😊</span> {user?.name || 'Гость'}
          <RunawayButton className="btn-red app-header__logout" onClick={handleLogout} maxRuns={4}>
            🚪 Выйти
          </RunawayButton>
        </div>
      </header>
      <Breadcrumbs />
      <main className="app-main">
        <Outlet />
      </main>
      <div className="app-sidebar-hint rotated-label wiggle">удачи в работе! 🍀💪</div>
    </div>
  );
}
