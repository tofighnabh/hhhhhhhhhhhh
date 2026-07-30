import { useState } from 'react';
import { api } from '../api';

export default function OrderForm({ symbol, lastPrice, kycStatus, onPlaced }) {
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState(lastPrice);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = Number(price || 0) * Number(quantity || 0);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.placeOrder({ symbol, side, price: Number(price), quantity: Number(quantity) });
      onPlaced?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="order-form" onSubmit={submit}>
      <div className="side-toggle">
        <button type="button" className={side === 'buy' ? 'active buy' : 'buy'} onClick={() => setSide('buy')}>خرید</button>
        <button type="button" className={side === 'sell' ? 'active sell' : 'sell'} onClick={() => setSide('sell')}>فروش</button>
      </div>

      <label>
        قیمت (ریال)
        <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} required />
      </label>

      <label>
        تعداد
        <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
      </label>

      <div className="order-total">
        <span>مبلغ کل</span>
        <span>{new Intl.NumberFormat('fa-IR').format(total)} ریال</span>
      </div>

      {kycStatus !== 'verified' && (
        <p className="notice-warning">
          حساب شما هنوز احراز هویت نشده. سفارش‌ها تا تایید KYC ثبت نمی‌شوند.
        </p>
      )}

      {error && <p className="notice-error">{error}</p>}

      <button className={`btn-primary ${side === 'buy' ? 'buy' : 'sell'}`} disabled={loading}>
        {loading ? 'در حال ثبت...' : side === 'buy' ? 'ثبت سفارش خرید' : 'ثبت سفارش فروش'}
      </button>
    </form>
  );
}
