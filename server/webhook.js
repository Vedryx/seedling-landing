// Handles Cashfree payment webhooks (sent to order_meta.notify_url).
// On PAYMENT_SUCCESS it re-checks the order with Cashfree and emails The Seedling.
import { fetchOrder, verifyWebhookSignature } from './cashfree.js';
import { isEmailConfigured, sendBookingEmail } from './notify.js';

/**
 * @returns {{ status: number, body: object }}
 * 2xx tells Cashfree we're done; 5xx makes Cashfree retry (the email itself is sent at most once).
 */
export async function handleCashfreeWebhook({ rawBody, timestamp, signature }) {
  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    console.warn('Cashfree webhook: signature check failed');
    return { status: 401, body: { message: 'Invalid signature' } };
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { message: 'Bad JSON' } };
  }

  // Only successful payments matter here; acknowledge everything else (failed, dropped, tests).
  if (event.type !== 'PAYMENT_SUCCESS_WEBHOOK') return { status: 200, body: { ignored: event.type } };

  const orderId = event.data?.order?.order_id;
  if (!orderId) return { status: 400, body: { message: 'No order_id' } };

  try {
    const order = await fetchOrder(orderId);
    if (order.order_status !== 'PAID') {
      console.warn(`Cashfree webhook: order ${orderId} is ${order.order_status}, not emailing`);
      return { status: 200, body: { ignored: order.order_status } };
    }
    if (!isEmailConfigured) {
      console.warn(`Cashfree webhook: RESEND_API_KEY not set, no email for ${orderId}`);
      return { status: 200, body: { emailed: false } };
    }
    await sendBookingEmail({ order, paymentTime: event.data?.payment?.payment_time || event.event_time });
    return { status: 200, body: { emailed: true } };
  } catch (err) {
    console.error(`Cashfree webhook: ${orderId}:`, err.message);
    return { status: 500, body: { message: 'Retry later' } };
  }
}
