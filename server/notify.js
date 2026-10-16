// Booking email to The Seedling via Resend (https://resend.com/docs/api-reference/emails/send-email).
// RESEND_API_KEY is required. From/to have defaults and can be overridden in env.
const {
  RESEND_API_KEY,
  BOOKING_NOTIFY_FROM = 'The Seedling bookings <signup@team.vedryxtech.com>',
  BOOKING_NOTIFY_TO = 'theseedling.edu@gmail.com',
} = process.env;

export const isEmailConfigured = Boolean(RESEND_API_KEY);

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const formatIst = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST`;
};

/**
 * Sends one email per paid order. The order ID is the Resend idempotency key, so Cashfree
 * retrying the same webhook doesn't send a second email (Resend keeps keys for 24 hours).
 */
export async function sendBookingEmail({ order, paymentTime }) {
  const customer = order.customer_details || {};
  const tags = order.order_tags || {};
  const phone = String(customer.customer_phone || '').replace(/\D/g, '').slice(-10);
  const child = tags.child_name || 'Child';
  const childClass = tags.child_class ? `Class ${tags.child_class}` : '';
  const amount = `₹${Number(order.order_amount).toLocaleString('en-IN')}`;
  const paidAt = formatIst(paymentTime);

  const rows = [
    ['Parent', customer.customer_name],
    ['WhatsApp', phone && { text: `+91 ${phone}`, href: `https://wa.me/91${phone}` }],
    ['Email', customer.customer_email && { text: customer.customer_email, href: `mailto:${customer.customer_email}` }],
    ['Child', [child, childClass].filter(Boolean).join(', ')],
    ['Amount', `${amount}, paid`],
    ['Order ID', order.order_id],
    ['Paid at', paidAt],
  ].filter(([, value]) => value);

  const cell = (value) =>
    typeof value === 'object'
      ? `<a href="${escapeHtml(value.href)}" style="color:#3A2318">${escapeHtml(value.text)}</a>`
      : escapeHtml(value);

  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#3A2318;max-width:520px">
  <h2 style="font-weight:600;margin:0 0 12px">New booking: ${escapeHtml(child)}${childClass ? `, ${escapeHtml(childClass)}` : ''}</h2>
  <table cellpadding="6" style="border-collapse:collapse;font-size:15px">
    ${rows.map(([label, value]) => `<tr><td style="color:#694A3A;padding-right:16px">${label}</td><td>${cell(value)}</td></tr>`).join('\n    ')}
  </table>
  <p style="font-size:14px;color:#694A3A;margin-top:16px">Next: WhatsApp the parent within 24 hours to confirm the slot and share the venue.</p>
</div>`;

  const text = [
    `New booking: ${child}${childClass ? `, ${childClass}` : ''}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${typeof value === 'object' ? value.text : value}`),
    '',
    'Next: WhatsApp the parent within 24 hours to confirm the slot and share the venue.',
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `seedling-booking-${order.order_id}`,
    },
    body: JSON.stringify({
      from: BOOKING_NOTIFY_FROM,
      to: BOOKING_NOTIFY_TO.split(',').map((s) => s.trim()).filter(Boolean),
      ...(customer.customer_email && { reply_to: customer.customer_email }),
      subject: `New booking: ${child}${childClass ? `, ${childClass}` : ''} · ${amount}`,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${detail}`);
  }
}
