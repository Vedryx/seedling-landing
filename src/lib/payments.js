import { load } from '@cashfreepayments/cashfree-js';
import { API_BASE } from '../config.js';

// The backend says which mode (sandbox/production) matches its keys.
const cashfreeByMode = {};
function getCashfree(mode) {
  cashfreeByMode[mode] ??= load({ mode }).catch((err) => {
    delete cashfreeByMode[mode];
    throw err;
  });
  return cashfreeByMode[mode];
}

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}

/**
 * Creates the order on our backend (amount is fixed server-side), then hands
 * off to Cashfree's hosted checkout. The parent comes back to
 * /thank-you?order_id=… via the return_url set by the backend.
 */
export async function startCheckout(booking) {
  const { payment_session_id, mode } = await request('/api/orders', { method: 'POST', body: JSON.stringify(booking) });
  const cashfree = await getCashfree(mode === 'production' ? 'production' : 'sandbox');
  if (!cashfree) throw new Error('Payment could not load. Please check your connection and try again.');
  const result = await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_self' });
  if (result?.error) throw new Error(result.error.message || 'Payment could not start. Please try again.');
}

/**
 * Returns Cashfree's order_status (PAID | ACTIVE | EXPIRED | TERMINATED | …)
 * and the amount actually charged on that order.
 */
export async function getOrder(orderId) {
  const { order_status, order_amount, order_currency } = await request(`/api/orders/${encodeURIComponent(orderId)}`);
  return { status: order_status, amount: Number(order_amount), currency: order_currency || 'INR' };
}
