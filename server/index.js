// Local dev payment API (Vercel uses api/orders/* instead). No dependencies, Node 20+.
//   POST /api/orders            -> { order_id, payment_session_id }
//   GET  /api/orders/:order_id  -> { order_id, order_status }
// Run: cp .env.example .env, fill in sandbox keys, then `npm run server`.
import { createServer } from 'node:http';
import { createOrder, getOrder, errorResponse, isConfigured, cashfreeEnv } from './cashfree.js';

const PORT = process.env.PORT || 8787;

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) throw Object.assign(new Error('Too large'), { status: 413 });
  }
  try { return JSON.parse(raw || '{}'); } catch { throw Object.assign(new Error('Bad request'), { status: 400 }); }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      return send(res, 200, await createOrder(await readJson(req)));
    }
    const match = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (req.method === 'GET' && match) {
      return send(res, 200, await getOrder(decodeURIComponent(match[1])));
    }
    send(res, 404, { message: 'Not found' });
  } catch (err) {
    const { status, body } = errorResponse(err);
    send(res, status, body);
  }
}).listen(PORT, () => {
  if (!isConfigured) console.warn('CASHFREE_APP_ID / CASHFREE_SECRET_KEY are not set.');
  console.log(`Payment API on http://localhost:${PORT} (${cashfreeEnv})`);
});
