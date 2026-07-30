import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function Register({ onAuth }) {
  const [form, setForm] = useState({ fullName: '', nationalCode: '', mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
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
        <h1>ساخت حساب کاربری</h1>
        <label>
          نام و نام خانوادگی
          <input value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
        </label>
        <label>
          کد ملی
          <input value={form.nationalCode} onChange={e => update('nationalCode', e.target.value)} maxLength={10} required />
        </label>
        <label>
          شماره موبایل
          <input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="09xxxxxxxxx" required />
        </label>
        <label>
          رمز عبور
          <input type="password" value={form.password} onChange={e => update('password', e.target.value)} minLength={8} required />
        </label>
        {error && <p className="notice-error">{error}</p>}
        <button className="btn-primary" disabled={loading}>{loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}</button>
        <p className="auth-switch">قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">وارد شوید</Link></p>
      </form>
    </div>
  );
}
