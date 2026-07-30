const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'خطایی رخ داد');
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  getStocks: () => request('/market/stocks'),
  getStock: (symbol) => request(`/market/stocks/${encodeURIComponent(symbol)}`),
  getOrderBook: (symbol) => request(`/market/stocks/${encodeURIComponent(symbol)}/orderbook`),
  getTrades: (symbol) => request(`/market/stocks/${encodeURIComponent(symbol)}/trades`),

  getWallet: () => request('/wallet'),
  demoDeposit: (amount) => request('/wallet/demo-deposit', { method: 'POST', body: { amount } }),

  getPortfolio: () => request('/portfolio'),

  getOrders: () => request('/orders'),
  placeOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  cancelOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' })
};
