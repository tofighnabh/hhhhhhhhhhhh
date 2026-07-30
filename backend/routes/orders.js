const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { placeOrder, cancelOrder } = require('../matchingEngine');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(orders);
});

router.post('/', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (user.kyc_status !== 'verified') {
    return res.status(403).json({
      error: 'برای ثبت سفارش واقعی، ابتدا باید احراز هویت (KYC) شما تایید شود.'
    });
  }

  const { symbol, side, price, quantity } = req.body;
  try {
    const order = placeOrder({ userId: req.userId, symbol, side, price: Number(price), quantity: Number(quantity) });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const order = cancelOrder(req.userId, req.params.id);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
