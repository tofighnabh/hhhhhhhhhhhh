const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { fullName, nationalCode, mobile, password } = req.body;

  if (!fullName || !nationalCode || !mobile || !password) {
    return res.status(400).json({ error: 'همه فیلدها الزامی است' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر باشد' });
  }
  if (!/^\d{10}$/.test(nationalCode)) {
    return res.status(400).json({ error: 'کد ملی باید ۱۰ رقم باشد' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE national_code = ? OR mobile = ?').get(nationalCode, mobile);
  if (existing) return res.status(409).json({ error: 'کاربری با این مشخصات قبلاً ثبت‌نام کرده است' });

  const userId = uuid();
  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users (id, full_name, national_code, mobile, password_hash, kyc_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(userId, fullName, nationalCode, mobile, passwordHash);

  db.prepare('INSERT INTO wallets (user_id, balance_rial) VALUES (?, 0)').run(userId);

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: { id: userId, fullName, mobile, kycStatus: 'pending' },
    notice: 'ثبت‌نام انجام شد. برای معامله واقعی، احراز هویت (KYC) و اتصال به کارگزاری باید تکمیل شود.'
  });
});

router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
  if (!user) return res.status(401).json({ error: 'شماره موبایل یا رمز عبور اشتباه است' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'شماره موبایل یا رمز عبور اشتباه است' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, fullName: user.full_name, mobile: user.mobile, kycStatus: user.kyc_status }
  });
});

module.exports = router;
