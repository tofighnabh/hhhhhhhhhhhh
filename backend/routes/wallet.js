const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.userId);
  res.json(wallet);
});

// DEMO ONLY: instantly credits the wallet. In production, replace this with
// a real payment gateway callback (e.g. زرین‌پال / آی‌دی‌پی) that verifies
// a completed bank transaction before crediting any balance.
router.post('/demo-deposit', (req, res) => {
  const { amount } = req.body;
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'مبلغ نامعتبر است' });

  db.prepare('UPDATE wallets SET balance_rial = balance_rial + ? WHERE user_id = ?').run(amt, req.userId);
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.userId);
  res.json(wallet);
});

module.exports = router;
