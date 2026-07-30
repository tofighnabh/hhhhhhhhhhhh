import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Market from './pages/Market.jsx';
import StockDetail from './pages/StockDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Wallet from './pages/Wallet.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function onAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={onLogout} />
      {user?.kycStatus === 'pending' && (
        <div className="kyc-banner">
          حساب شما هنوز احراز هویت نشده — سفارش‌های واقعی تا تایید KYC ثبت نمی‌شوند.
        </div>
      )}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Market />} />
          <Route path="/stock/:symbol" element={<StockDetail user={user} />} />
          <Route path="/portfolio" element={user ? <Portfolio /> : <Navigate to="/login" />} />
          <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onAuth={onAuth} />} />
          <Route path="/register" element={<Register onAuth={onAuth} />} />
        </Routes>
      </main>
    </div>
  );
}
