// Vercel function: POST /api/orders -> { order_id, payment_session_id }
import { createOrder, errorResponse } from '../../server/cashfree.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = host ? `${req.headers['x-forwarded-proto'] || 'https'}://${host}` : undefined;
    res.status(200).json(await createOrder(req.body || {}, origin));
  } catch (err) {
    const { status, body } = errorResponse(err);
    res.status(status).json(body);
  }
}
