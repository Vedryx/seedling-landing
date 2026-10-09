import { load } from '@cashfreepayments/cashfree-js';
import { API_BASE, CASHFREE_MODE } from '../config.js';

let cashfreePromise;
function getCashfree() {
  cashfreePromise ??= load({ mode: CASHFREE_MODE });
  return cashfreePromise;
}

// Warm up the SDK (e.g. when the booking sheet opens) so checkout starts instantly.
export function preloadCashfree() {
  getCashfree().catch(() => { cashfreePromise = undefined; });
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
  const [{ payment_session_id }, cashfree] = await Promise.all([
    request('/api/orders', { method: 'POST', body: JSON.stringify(booking) }),
    getCashfree(),
  ]);
  if (!cashfree) throw new Error('Payment could not load. Please check your connection and try again.');
  const result = await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_self' });
  if (result?.error) throw new Error(result.error.message || 'Payment could not start. Please try again.');
}

/** Returns Cashfree's order_status: PAID | ACTIVE | EXPIRED | TERMINATED | … */
export async function getOrderStatus(orderId) {
  const { order_status } = await request(`/api/orders/${encodeURIComponent(orderId)}`);
  return order_status;
}
