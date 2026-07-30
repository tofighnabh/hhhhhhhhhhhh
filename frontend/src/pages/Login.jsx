import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function Login({ onAuth }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ mobile, password });
      onAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>ورود به حساب کاربری</h1>
        <label>
          شماره موبایل
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="09xxxxxxxxx" required />
        </label>
        <label>
          رمز عبور
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="notice-error">{error}</p>}
        <button className="btn-primary" disabled={loading}>{loading ? 'در حال ورود...' : 'ورود'}</button>
        <p className="auth-switch">حساب ندارید؟ <Link to="/register">ثبت‌نام کنید</Link></p>
      </form>
    </div>
  );
}
