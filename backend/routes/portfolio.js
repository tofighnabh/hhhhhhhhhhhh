const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const holdings = db.prepare(`
    SELECT h.symbol, h.quantity, h.avg_price, s.name, s.last_price
    FROM holdings h JOIN stocks s ON s.symbol = h.symbol
    WHERE h.user_id = ? AND h.quantity > 0
  `).all(req.userId);

  const withPnl = holdings.map(h => ({
    ...h,
    market_value: h.quantity * h.last_price,
    pnl: (h.last_price - h.avg_price) * h.quantity,
    pnl_percent: Number((((h.last_price - h.avg_price) / h.avg_price) * 100).toFixed(2))
  }));

  res.json(withPnl);
});

module.exports = router;
