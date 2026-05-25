import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser } from '../store/authSlice';
import './LoginPage.css';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validError, setValidError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidError('');

    if (!name.trim()) { setValidError('Введи имя 👤'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setValidError('Введи корректный email 📧'); return; }
    if (password.length < 8) { setValidError('Пароль минимум 8 символов 🔑'); return; }
    if (password !== confirm) { setValidError('Пароли не совпадают 🔐'); return; }

    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">
          <span style={{ color: 'var(--rainbow-yellow)' }}>Добро</span>{' '}
          <span style={{ color: 'var(--rainbow-green)' }}>пожаловать!</span>{' '}
          🎉🥳
        </h1>
        <div className="login-field">
          <label>👤 Имя</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Твоё имя" />
        </div>
        <div className="login-field">
          <label>📧 Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="login-field">
          <label>🔑 Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 8 символов" />
        </div>
        <div className="login-field">
          <label>🔑 Подтверди пароль</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Ещё раз" />
        </div>
        {(validError || error) && <p className="login-error">{validError || error}</p>}
        <button type="submit" className="btn-green login-submit" disabled={loading}>
          {loading ? '⏳ Регистрация...' : '🎊 Зарегистрироваться'}
        </button>
        <p className="login-link">
          Уже есть аккаунт? <Link to="/login">Войди! 🔓</Link>
        </p>
      </form>
    </div>
  );
}
