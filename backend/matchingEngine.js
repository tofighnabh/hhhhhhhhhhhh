const { v4: uuid } = require('uuid');
const db = require('./db');
const broker = require('./broker');

/**
 * Places a new order.
 *
 * DEMO mode (BROKER_MODE=demo): the order is matched in-app against other
 * users' resting orders. This is a simulation — no real shares or money
 * ever move. Good for building/testing the whole product.
 *
 * LIVE mode (BROKER_MODE=live): the order is instead forwarded to the
 * licensed broker's API (see broker.js). The broker's matching engine —
 * connected to the real exchange — does the actual matching. This app
 * then just reflects the broker's fills back to the user. This is the
 * ONLY way real trades can legally happen; see README.
 */
function placeOrder({ userId, symbol, side, price, quantity }) {
  const stock = db.prepare('SELECT * FROM stocks WHERE symbol = ?').get(symbol);
  if (!stock) throw new Error('نماد یافت نشد');
  if (quantity <= 0) throw new Error('تعداد باید بزرگ‌تر از صفر باشد');
  if (price <= 0) throw new Error('قیمت نامعتبر است');

  if (broker.mode === 'live') {
    return broker.placeLiveOrder({ userId, symbol, side, price, quantity });
  }

  return placeDemoOrder({ userId, symbol, side, price, quantity });
}

function placeDemoOrder({ userId, symbol, side, price, quantity }) {
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);

  if (side === 'buy') {
    const cost = price * quantity;
    if (wallet.balance_rial < cost) throw new Error('موجودی کیف پول کافی نیست');
    db.prepare('UPDATE wallets SET balance_rial = balance_rial - ? WHERE user_id = ?').run(cost, userId);
  } else if (side === 'sell') {
    const holding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, symbol);
    if (!holding || holding.quantity < quantity) throw new Error('تعداد سهام کافی برای فروش ندارید');
    db.prepare('UPDATE holdings SET quantity = quantity - ? WHERE user_id = ? AND symbol = ?').run(quantity, userId, symbol);
  } else {
    throw new Error('نوع سفارش نامعتبر است');
  }

  const orderId = uuid();
  db.prepare(`
    INSERT INTO orders (id, user_id, symbol, side, order_type, price, quantity, remaining, status)
    VALUES (?, ?, ?, ?, 'limit', ?, ?, ?, 'open')
  `).run(orderId, userId, symbol, side, price, quantity, quantity);

  matchOrder(orderId);

  return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
}

// Continuous double-auction matching: best price + earliest time gets priority.
function matchOrder(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order || order.remaining <= 0) return;

  const oppositeSide = order.side === 'buy' ? 'sell' : 'buy';
  const priceCmp = order.side === 'buy' ? '<=' : '>=';
  const orderBy = order.side === 'buy' ? 'price ASC, created_at ASC' : 'price DESC, created_at ASC';

  const candidates = db.prepare(`
    SELECT * FROM orders
    WHERE symbol = ? AND side = ? AND status IN ('open','partial') AND price ${priceCmp} ?
    ORDER BY ${orderBy}
  `).all(order.symbol, oppositeSide, order.price);

  for (const match of candidates) {
    if (order.remaining <= 0) break;

    const tradeQty = Math.min(order.remaining, match.remaining);
    const tradePrice = match.price; // resting order sets the price

    const buyOrder = order.side === 'buy' ? order : match;
    const sellOrder = order.side === 'sell' ? order : match;

    executeTrade({ buyOrder, sellOrder, tradeQty, tradePrice, symbol: order.symbol });

    order.remaining -= tradeQty;
    match.remaining -= tradeQty;

    updateOrderStatus(match.id, match.remaining);
  }

  updateOrderStatus(order.id, order.remaining);
}

function executeTrade({ buyOrder, sellOrder, tradeQty, tradePrice, symbol }) {
  db.prepare(`
    INSERT INTO trades (id, symbol, buy_order_id, sell_order_id, price, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuid(), symbol, buyOrder.id, sellOrder.id, tradePrice, tradeQty);

  // Update buyer holdings (weighted average price)
  const holding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(buyOrder.user_id, symbol);
  if (holding) {
    const newQty = holding.quantity + tradeQty;
    const newAvg = Math.round((holding.avg_price * holding.quantity + tradePrice * tradeQty) / newQty);
    db.prepare('UPDATE holdings SET quantity = ?, avg_price = ? WHERE user_id = ? AND symbol = ?')
      .run(newQty, newAvg, buyOrder.user_id, symbol);
  } else {
    db.prepare('INSERT INTO holdings (user_id, symbol, quantity, avg_price) VALUES (?, ?, ?, ?)')
      .run(buyOrder.user_id, symbol, tradeQty, tradePrice);
  }

  // Credit seller's wallet
  db.prepare('UPDATE wallets SET balance_rial = balance_rial + ? WHERE user_id = ?')
    .run(tradePrice * tradeQty, sellOrder.user_id);

  // If buyer paid a higher limit price than the actual trade price, refund the difference
  if (buyOrder.price > tradePrice) {
    const refund = (buyOrder.price - tradePrice) * tradeQty;
    db.prepare('UPDATE wallets SET balance_rial = balance_rial + ? WHERE user_id = ?')
      .run(refund, buyOrder.user_id);
  }

  // Update last traded price for the stock
  db.prepare('UPDATE stocks SET last_price = ? WHERE symbol = ?').run(tradePrice, symbol);
}

function updateOrderStatus(orderId, remaining) {
  const status = remaining <= 0 ? 'filled' : 'partial';
  db.prepare('UPDATE orders SET remaining = ?, status = ? WHERE id = ?').run(Math.max(remaining, 0), status, orderId);
}

function cancelOrder(userId, orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId);
  if (!order) throw new Error('سفارش یافت نشد');
  if (!['open', 'partial'].includes(order.status)) throw new Error('این سفارش قابل لغو نیست');

  if (broker.mode === 'live') {
    broker.cancelLiveOrder(order);
  }

  // Refund reserved funds/shares for the untraded remainder
  if (order.side === 'buy') {
    db.prepare('UPDATE wallets SET balance_rial = balance_rial + ? WHERE user_id = ?')
      .run(order.price * order.remaining, userId);
  } else {
    db.prepare(`
      INSERT INTO holdings (user_id, symbol, quantity, avg_price)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(user_id, symbol) DO UPDATE SET quantity = quantity + excluded.quantity
    `).run(userId, order.symbol, order.remaining);
  }

  db.prepare('UPDATE orders SET status = ?, remaining = 0 WHERE id = ?').run('cancelled', orderId);
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
}

module.exports = { placeOrder, cancelOrder };
