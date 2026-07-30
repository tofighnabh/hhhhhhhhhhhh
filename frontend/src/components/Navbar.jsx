import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <span className="brand-mark">ب</span>
        <span className="brand-name">بورس آنلاین</span>
      </div>

      {user ? (
        <nav className="navbar-links">
          <Link to="/">بازار</Link>
          <Link to="/portfolio">پرتفوی</Link>
          <Link to="/wallet">کیف پول</Link>
          <span className="navbar-user">{user.fullName}</span>
          <button className="btn-ghost" onClick={onLogout}>خروج</button>
        </nav>
      ) : (
        <nav className="navbar-links">
          <Link to="/login">ورود</Link>
          <Link to="/register" className="btn-primary-sm">ثبت‌نام</Link>
        </nav>
      )}
    </header>
  );
}
