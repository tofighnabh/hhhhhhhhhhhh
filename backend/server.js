require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const orderRoutes = require('./routes/orders');
const walletRoutes = require('./routes/wallet');
const portfolioRoutes = require('./routes/portfolio');
const broker = require('./broker');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brokerMode: broker.mode });
});

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/portfolio', portfolioRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API روی پورت ${PORT} اجرا شد — حالت کارگزار: ${broker.mode}`);
  if (broker.mode === 'demo') {
    console.log('⚠️  در حالت DEMO هستید: معاملات شبیه‌سازی‌شده‌اند و واقعی نیستند. برای اطلاعات بیشتر README را ببینید.');
  }
});
