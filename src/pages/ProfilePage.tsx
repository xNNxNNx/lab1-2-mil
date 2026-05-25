import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, changePassword } from '../store/authSlice';
import './ProfilePage.css';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const docCount = useAppSelector((s) => s.documents.list.length);

  const [name, setName] = useState(user?.name || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState('');

  const handleNameSave = async () => {
    if (!name.trim()) return;
    await dispatch(updateProfile({ name }));
    setMsg('Имя обновлено! ✅');
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePasswordChange = async () => {
    if (newPass.length < 8) { setMsg('Новый пароль минимум 8 символов 🔑'); return; }
    if (newPass !== confirmPass) { setMsg('Пароли не совпадают 🔐'); return; }
    const result = await dispatch(changePassword({ oldPassword: oldPass, newPassword: newPass }));
    if (changePassword.fulfilled.match(result)) {
      setMsg('Пароль изменён! ✅');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } else {
      setMsg('Ошибка смены пароля 😓');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title spider-title">Мой профиль 🦸</h1>

      <div className="profile-card">
        <div className="profile-avatar">🦸</div>
        <div className="profile-avatar-hint rotated-label">это ты! 🌟</div>

        <div className="profile-info">
          <p className="profile-name">{user?.name}</p>
          <p className="profile-email">📧 {user?.email}</p>
        </div>

        <div className="profile-stats">
          <p>📄 Документов: {docCount} {docCount > 5 ? '🏆' : docCount === 0 ? '🌱' : ''}</p>
          <p>🗓️ С нами с: {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString('ru-RU') : '—'}</p>
        </div>

        <div className="profile-section">
          <h3>✏️ Изменить имя</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-green" onClick={handleNameSave}>💾 Сохранить</button>
        </div>

        <div className="profile-section">
          <h3>🔑 Сменить пароль</h3>
          <input type="password" placeholder="Старый пароль" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
          <input type="password" placeholder="Новый пароль" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          <input type="password" placeholder="Подтверди новый" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          <button className="btn-blue" onClick={handlePasswordChange}>🔄 Сменить</button>
        </div>

        {msg && <p className="profile-msg">{msg}</p>}
      </div>
    </div>
  );
}
