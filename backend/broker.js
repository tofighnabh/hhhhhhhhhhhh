/**
 * BROKER INTEGRATION LAYER
 * ========================
 * This is the ONE file you need to fill in to make trades real instead of
 * simulated. Everything else in this app (auth, wallet UI, order book UI,
 * portfolio, etc.) stays the same either way.
 *
 * Why this file exists:
 * Individuals and unlicensed companies cannot connect directly to a stock
 * exchange (e.g. TSETMC / Tehran Stock Exchange). Real trading requires
 * routing every order through a licensed brokerage's systems. In Iran that
 * means partnering with a broker (کارگزاری) that is a member of the
 * exchange and getting API/OMS access from them — most major Iranian
 * brokerages (e.g. آگاه، مفید، فارابی و ...) offer this to fintech
 * partners, but you must apply and sign an agreement with them; it is not
 * a public/open API.
 *
 * Once you have credentials from a broker, implement the two functions
 * below to call their REST/WebSocket API instead of the in-app matching
 * engine, and set BROKER_MODE=live in your .env file.
 */

const mode = process.env.BROKER_MODE || 'demo';

async function placeLiveOrder({ userId, symbol, side, price, quantity }) {
  // Example shape — replace with your broker's actual API contract.
  //
  // const res = await fetch(`${process.env.BROKER_API_BASE_URL}/orders`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.BROKER_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     clientOrderId: userId,
  //     isin: symbolToIsin(symbol),
  //     side,               // 'buy' | 'sell'
  //     price,
  //     quantity,
  //   }),
  // });
  // const data = await res.json();
  // return data;

  throw new Error(
    'BROKER_MODE=live است ولی broker.js هنوز به API کارگزاری واقعی وصل نشده. ' +
    'ابتدا با یک کارگزاری دارای مجوز قرارداد ببندید و این تابع را کامل کنید.'
  );
}

async function cancelLiveOrder(order) {
  // await fetch(`${process.env.BROKER_API_BASE_URL}/orders/${order.broker_order_id}`, {
  //   method: 'DELETE',
  //   headers: { Authorization: `Bearer ${process.env.BROKER_API_KEY}` },
  // });
  throw new Error('BROKER_MODE=live است ولی broker.js هنوز به API کارگزاری واقعی وصل نشده.');
}

module.exports = { mode, placeLiveOrder, cancelLiveOrder };
