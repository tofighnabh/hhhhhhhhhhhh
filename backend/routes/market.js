const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/stocks', (req, res) => {
  const stocks = db.prepare('SELECT * FROM stocks ORDER BY symbol').all();
  const withChange = stocks.map(s => ({
    ...s,
    change_percent: Number((((s.last_price - s.prev_close) / s.prev_close) * 100).toFixed(2))
  }));
  res.json(withChange);
});

router.get('/stocks/:symbol', (req, res) => {
  const stock = db.prepare('SELECT * FROM stocks WHERE symbol = ?').get(req.params.symbol);
  if (!stock) return res.status(404).json({ error: 'نماد یافت نشد' });
  res.json(stock);
});

router.get('/stocks/:symbol/orderbook', (req, res) => {
  const { symbol } = req.params;
  const bids = db.prepare(`
    SELECT price, SUM(remaining) as quantity FROM orders
    WHERE symbol = ? AND side = 'buy' AND status IN ('open','partial')
    GROUP BY price ORDER BY price DESC LIMIT 10
  `).all(symbol);
  const asks = db.prepare(`
    SELECT price, SUM(remaining) as quantity FROM orders
    WHERE symbol = ? AND side = 'sell' AND status IN ('open','partial')
    GROUP BY price ORDER BY price ASC LIMIT 10
  `).all(symbol);
  res.json({ bids, asks });
});

router.get('/stocks/:symbol/trades', (req, res) => {
  const trades = db.prepare(`
    SELECT price, quantity, created_at FROM trades WHERE symbol = ?
    ORDER BY created_at DESC LIMIT 30
  `).all(req.params.symbol);
  res.json(trades);
});

module.exports = router;
