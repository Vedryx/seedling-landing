// Vercel function: GET /api/orders/:id -> { order_id, order_status }
import { getOrder, errorResponse } from '../../server/cashfree.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(await getOrder(req.query.id));
  } catch (err) {
    const { status, body } = errorResponse(err);
    res.status(status).json(body);
  }
}
