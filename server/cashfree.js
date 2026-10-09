// Cashfree PG order logic shared by the local dev server (server/index.js)
// and the Vercel functions (api/orders/*). Secrets are read from env only.
import { randomUUID } from 'node:crypto';

const {
  CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY,
  CASHFREE_ENV = 'sandbox',
  SITE_URL = 'http://localhost:5173',
} = process.env;

export const isConfigured = Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY);
export const cashfreeEnv = CASHFREE_ENV;

const CASHFREE_BASE = CASHFREE_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
const API_VERSION = '2025-01-01';

// Price is fixed here, never taken from the browser.
const PRICE_INR = 799;
const ALLOWED_CLASSES = new Set(['2', '3', '4', '5', '6', '7', '8']);

async function cashfree(path, init = {}) {
  if (!isConfigured) {
    console.error('CASHFREE_APP_ID / CASHFREE_SECRET_KEY are not set.');
    throw Object.assign(new Error('Payments are not available right now. Please WhatsApp us to book.'), { status: 503 });
  }
  const res = await fetch(`${CASHFREE_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Cashfree error', res.status, data);
    throw Object.assign(new Error('Payment provider error'), { status: 502 });
  }
  return data;
}

const clean = (v, max = 60) => String(v ?? '').trim().slice(0, max);

export async function createOrder(body) {
  const booking = {
    parentName: clean(body.parentName),
    phone: clean(body.phone, 10),
    email: clean(body.email, 100),
    childName: clean(body.childName, 40),
    childClass: clean(body.childClass, 2),
    version: /^[abc]$/.test(body.version) ? body.version : 'b',
  };
  if (!booking.parentName || !booking.childName || !ALLOWED_CLASSES.has(booking.childClass) || !/^[6-9]\d{9}$/.test(booking.phone)) {
    throw Object.assign(new Error('Please check your details and try again.'), { status: 400 });
  }

  const orderId = `seedling_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const order = await cashfree('/orders', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      order_amount: PRICE_INR,
      order_currency: 'INR',
      customer_details: {
        customer_id: `p_${booking.phone}`,
        customer_phone: booking.phone,
        customer_name: booking.parentName,
        ...(booking.email && { customer_email: booking.email }),
      },
      order_meta: {
        return_url: `${SITE_URL}/thank-you?v=${booking.version}&order_id={order_id}`,
        // notify_url: `${API_PUBLIC_URL}/api/cashfree/webhook`, // recommended in production
      },
      order_note: 'The Seedling session',
      order_tags: {
        child_name: booking.childName,
        child_class: booking.childClass,
        landing_version: booking.version,
      },
    }),
  });
  // TODO(backend): persist the booking against order.order_id here.
  return { order_id: order.order_id, payment_session_id: order.payment_session_id };
}

export async function getOrder(orderId) {
  if (!/^[\w-]{1,50}$/.test(String(orderId))) throw Object.assign(new Error('Not found'), { status: 404 });
  const order = await cashfree(`/orders/${orderId}`);
  return { order_id: order.order_id, order_status: order.order_status };
}

// Hides internal errors from the browser; 4xx messages are safe to show.
export function errorResponse(err) {
  const status = err.status || 500;
  return { status, body: { message: status < 500 || status === 503 ? err.message : 'Something went wrong. Please try again.' } };
}
