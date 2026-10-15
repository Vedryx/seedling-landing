// Vercel function: POST /api/cashfree/webhook (Cashfree payment notifications).
// Uses the Web Request API so the raw body reaches the signature check unchanged.
import { handleCashfreeWebhook } from '../../server/webhook.js';

export async function POST(request) {
  const { status, body } = await handleCashfreeWebhook({
    rawBody: await request.text(),
    timestamp: request.headers.get('x-webhook-timestamp'),
    signature: request.headers.get('x-webhook-signature'),
  });
  return Response.json(body, { status });
}
