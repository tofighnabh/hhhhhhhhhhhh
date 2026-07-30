import { useEffect, useState } from 'react';
import { api } from '../api';

function fmt(n) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState(10000000);
  const [loading, setLoading] = useState(false);

  async function load() {
    setWallet(await api.getWallet());
  }

  useEffect(() => { load(); }, []);

  async function deposit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const w = await api.demoDeposit(Number(amount));
      setWallet(w);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">کیف پول</h1>

      <div className="summary-cards">
        <div className="summary-card">
          <span>موجودی فعلی</span>
          <strong className="mono">{wallet ? fmt(wallet.balance_rial) : '...'} ریال</strong>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 420 }}>
        <h2>افزایش موجودی (نمایشی)</h2>
        <p className="notice-warning">
          این دکمه فقط برای محیط آزمایشی است. در نسخه واقعی، این بخش باید به یک درگاه پرداخت
          معتبر (مثل زرین‌پال) وصل شود که پس از تایید تراکنش بانکی واقعی، موجودی را افزایش می‌دهد.
        </p>
        <form onSubmit={deposit}>
          <label>
            مبلغ (ریال)
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} />
          </label>
          <button className="btn-primary buy" disabled={loading}>
            {loading ? 'در حال واریز...' : 'واریز نمایشی'}
          </button>
        </form>
      </div>
    </div>
  );
}
