const db = require('./db');

const stocks = [
  { symbol: 'فولاد', name: 'فولاد مبارکه اصفهان', sector: 'فلزات اساسی', last_price: 8500, prev_close: 8320 },
  { symbol: 'فملی', name: 'ملی صنایع مس ایران', sector: 'فلزات اساسی', last_price: 15200, prev_close: 15400 },
  { symbol: 'خودرو', name: 'ایران خودرو', sector: 'خودرو', last_price: 2450, prev_close: 2400 },
  { symbol: 'شپنا', name: 'پالایش نفت اصفهان', sector: 'فرآورده‌های نفتی', last_price: 9800, prev_close: 9650 },
  { symbol: 'وبملت', name: 'بانک ملت', sector: 'بانک‌ها', last_price: 3120, prev_close: 3150 },
  { symbol: 'شستا', name: 'سرمایه‌گذاری تامین اجتماعی', sector: 'سرمایه‌گذاری', last_price: 1680, prev_close: 1655 },
  { symbol: 'اخابر', name: 'مخابرات ایران', sector: 'مخابرات', last_price: 3450, prev_close: 3480 },
  { symbol: 'کچاد', name: 'معدنی و صنعتی چادرملو', sector: 'معدن', last_price: 12100, prev_close: 11950 },
];

const insert = db.prepare(`
  INSERT INTO stocks (symbol, name, sector, last_price, prev_close)
  VALUES (@symbol, @name, @sector, @last_price, @prev_close)
  ON CONFLICT(symbol) DO UPDATE SET
    name=excluded.name, sector=excluded.sector,
    last_price=excluded.last_price, prev_close=excluded.prev_close
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

insertMany(stocks);
console.log(`${stocks.length} نماد نمونه در دیتابیس ثبت شد.`);
