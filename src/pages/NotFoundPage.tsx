import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      background: 'var(--bg-main)',
      minHeight: '100vh',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '120px',
        lineHeight: 1,
        marginBottom: '16px',
      }}>
        <span style={{ color: 'var(--rainbow-red)' }}>4</span>
        <span style={{ color: 'var(--rainbow-yellow)' }}>0</span>
        <span style={{ color: 'var(--rainbow-blue)' }}>4</span>
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '8px' }}>
        Ой, такой страницы нету 😿
      </p>
      <p style={{ fontSize: '48px', marginBottom: '30px' }}>🕸️🕷️</p>
      <Link to="/dashboard">
        <button className="btn-green" style={{ fontSize: '18px', padding: '14px 32px' }}>
          🏠 Вернуться на главную
        </button>
      </Link>
    </div>
  );
}
