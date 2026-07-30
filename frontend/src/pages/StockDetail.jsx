import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import OrderBook from '../components/OrderBook.jsx';
import OrderForm from '../components/OrderForm.jsx';

function fmt(n) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function StockDetail({ user }) {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [book, setBook] = useState({ bids: [], asks: [] });
  const [trades, setTrades] = useState([]);

  const load = useCallback(async () => {
    const [s, b, t] = await Promise.all([
      api.getStock(symbol),
      api.getOrderBook(symbol),
      api.getTrades(symbol)
    ]);
    setStock(s);
    setBook(b);
    setTrades(t);
  }, [symbol]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  if (!stock) return <div className="page">در حال بارگذاری...</div>;

  const changePercent = Number((((stock.last_price - stock.prev_close) / stock.prev_close) * 100).toFixed(2));

  return (
    <div className="page">
      <div className="stock-header">
        <div>
          <h1 className="page-title">{stock.symbol}</h1>
          <p className="page-subtitle">{stock.name} — {stock.sector}</p>
        </div>
        <div className="stock-price-box">
          <div className="mono stock-price">{fmt(stock.last_price)} ریال</div>
          <div className={`mono ${changePercent >= 0 ? 'up' : 'down'}`}>
            {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent)}٪
          </div>
        </div>
      </div>

      <div className="stock-grid">
        <div className="panel">
          <h2>دفتر سفارشات</h2>
          <OrderBook bids={book.bids} asks={book.asks} />
        </div>

        <div className="panel">
          <h2>ثبت سفارش</h2>
          {user ? (
            <OrderForm
              symbol={stock.symbol}
              lastPrice={stock.last_price}
              kycStatus={user.kycStatus}
              onPlaced={load}
            />
          ) : (
            <p className="notice-warning">برای ثبت سفارش ابتدا وارد حساب کاربری خود شوید.</p>
          )}
        </div>

        <div className="panel">
          <h2>آخرین معاملات</h2>
          <table className="trades-table">
            <thead><tr><th>قیمت</th><th>تعداد</th></tr></thead>
            <tbody>
              {trades.length === 0 && <tr><td colSpan={2} className="orderbook-empty">معامله‌ای ثبت نشده</td></tr>}
              {trades.map((t, i) => (
                <tr key={i}>
                  <td className="mono">{fmt(t.price)}</td>
                  <td className="mono">{fmt(t.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
