import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser } from '../store/authSlice';
import './LoginPage.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validError, setValidError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidError('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidError('Введи корректный email 📧');
      return;
    }
    if (password.length < 8) {
      setValidError('Пароль минимум 8 символов 🔑');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-deco">🕷️</div>
        <h1 className="login-title">
          <span style={{ color: 'var(--rainbow-blue)' }}>Привет!</span>{' '}
          <span style={{ color: 'var(--rainbow-green)' }}>Заходи</span>{' '}
          👋😊
        </h1>
        <div className="login-field">
          <label>📧 Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="login-field">
          <label>🔑 Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 8 символов" />
        </div>
        {(validError || error) && (
          <p className="login-error">{validError || error}</p>
        )}
        <button type="submit" className="btn-blue login-submit" disabled={loading}>
          {loading ? '⏳ Входим...' : '🚀 Войти'}
        </button>
        <p className="login-link">
          Нет аккаунта? <Link to="/register">Регистрируйся! 🆓</Link>
        </p>
      </form>
    </div>
  );
}
