import { useEffect, useState } from 'react';
import { api } from '../api';

function fmt(n) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPortfolio().then(data => { setHoldings(data); setLoading(false); });
  }, []);

  const totalValue = holdings.reduce((sum, h) => sum + h.market_value, 0);
  const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);

  return (
    <div className="page">
      <h1 className="page-title">پرتفوی من</h1>

      {!loading && (
        <div className="summary-cards">
          <div className="summary-card">
            <span>ارزش کل سهام</span>
            <strong className="mono">{fmt(totalValue)} ریال</strong>
          </div>
          <div className="summary-card">
            <span>سود / زیان کل</span>
            <strong className={`mono ${totalPnl >= 0 ? 'up' : 'down'}`}>{fmt(totalPnl)} ریال</strong>
          </div>
        </div>
      )}

      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : holdings.length === 0 ? (
        <p className="notice-warning">هنوز سهامی در پرتفوی شما نیست.</p>
      ) : (
        <table className="market-table">
          <thead>
            <tr>
              <th>نماد</th>
              <th>تعداد</th>
              <th>قیمت میانگین خرید</th>
              <th>قیمت روز</th>
              <th>ارزش فعلی</th>
              <th>سود / زیان</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map(h => (
              <tr key={h.symbol}>
                <td>{h.symbol}</td>
                <td className="mono">{fmt(h.quantity)}</td>
                <td className="mono">{fmt(h.avg_price)}</td>
                <td className="mono">{fmt(h.last_price)}</td>
                <td className="mono">{fmt(h.market_value)}</td>
                <td className={`mono ${h.pnl >= 0 ? 'up' : 'down'}`}>
                  {fmt(h.pnl)} ({h.pnl_percent}٪)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
