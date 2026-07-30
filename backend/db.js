const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'bourse.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_code TEXT UNIQUE NOT NULL,   -- کد ملی، برای احراز هویت واقعی لازم است
  mobile TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  kyc_status TEXT NOT NULL DEFAULT 'pending', -- pending | verified | rejected
  broker_account_id TEXT,               -- شناسه حساب نزد کارگزاری واقعی (پس از احراز هویت)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wallets (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  balance_rial INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stocks (
  symbol TEXT PRIMARY KEY,       -- نماد، مثل «فولاد»
  name TEXT NOT NULL,            -- نام کامل شرکت
  sector TEXT,
  last_price INTEGER NOT NULL,   -- به ریال
  prev_close INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS holdings (
  user_id TEXT NOT NULL REFERENCES users(id),
  symbol TEXT NOT NULL REFERENCES stocks(symbol),
  quantity INTEGER NOT NULL DEFAULT 0,
  avg_price INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, symbol)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  symbol TEXT NOT NULL REFERENCES stocks(symbol),
  side TEXT NOT NULL,            -- buy | sell
  order_type TEXT NOT NULL DEFAULT 'limit', -- limit | market
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | partial | filled | cancelled
  broker_order_id TEXT,          -- شناسه سفارش نزد کارگزاری واقعی (broker live mode)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  buy_order_id TEXT NOT NULL,
  sell_order_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db;
