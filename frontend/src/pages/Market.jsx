import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function fmt(n) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function Market() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api.getStocks();
    setStocks(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">تابلوی بازار</h1>
      <p className="page-subtitle">قیمت‌ها هر چند ثانیه به‌روزرسانی می‌شوند</p>

      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : (
        <table className="market-table">
          <thead>
            <tr>
              <th>نماد</th>
              <th>نام شرکت</th>
              <th>آخرین قیمت</th>
              <th>تغییر</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.symbol}>
                <td>
                  <Link className="symbol-link" to={`/stock/${encodeURIComponent(s.symbol)}`}>{s.symbol}</Link>
                </td>
                <td>{s.name}</td>
                <td className="mono">{fmt(s.last_price)}</td>
                <td className={`mono ${s.change_percent >= 0 ? 'up' : 'down'}`}>
                  {s.change_percent >= 0 ? '▲' : '▼'} {Math.abs(s.change_percent)}٪
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
