function fmt(n) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function OrderBook({ bids, asks }) {
  return (
    <div className="orderbook">
      <div className="orderbook-col orderbook-asks">
        <div className="orderbook-head">فروش</div>
        {asks.length === 0 && <div className="orderbook-empty">سفارشی نیست</div>}
        {asks.map((a, i) => (
          <div className="orderbook-row ask" key={i}>
            <span className="ob-qty">{fmt(a.quantity)}</span>
            <span className="ob-price">{fmt(a.price)}</span>
          </div>
        ))}
      </div>
      <div className="orderbook-col orderbook-bids">
        <div className="orderbook-head">خرید</div>
        {bids.length === 0 && <div className="orderbook-empty">سفارشی نیست</div>}
        {bids.map((b, i) => (
          <div className="orderbook-row bid" key={i}>
            <span className="ob-price">{fmt(b.price)}</span>
            <span className="ob-qty">{fmt(b.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
