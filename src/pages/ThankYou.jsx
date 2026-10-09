import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { SESSION, CONTACT } from '../config.js';
import { getOrderStatus } from '../lib/payments.js';

const firedPurchases = new Set();

function trackPurchase(orderId) {
  if (!window.fbq || firedPurchases.has(orderId)) return;
  firedPurchases.add(orderId);
  window.fbq('track', 'Purchase', {
    value: SESSION.price,
    currency: 'INR',
    content_name: 'The Seedling session',
    content_category: `version_${SESSION.version}`,
  }, { eventID: orderId }); // eventID de-duplicates refreshes / server-side events
}

// Cashfree returns the parent here with ?order_id=… (set as return_url by the backend).
// We confirm the status with our backend rather than trusting the URL.
export default function ThankYou() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [state, setState] = useState(orderId ? 'checking' : 'missing');

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    getOrderStatus(orderId)
      .then((status) => {
        if (cancelled) return;
        if (status === 'PAID') {
          setState('paid');
          trackPurchase(orderId);
        } else {
          setState(status === 'ACTIVE' ? 'pending' : 'failed');
        }
      })
      .catch(() => !cancelled && setState('unknown'));
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div className="page-thanks">
      <SiteHeader />
      <main className="thanks" aria-live="polite">
        <div className="wrap thanks__inner">
          {state === 'checking' && <h1>Confirming your payment…</h1>}

          {(state === 'paid' || state === 'missing') && (
            <>
              <h1>Thank you, your booking is received.</h1>
              <p>I’ll message you on WhatsApp within 24 hours to confirm your slot and share the venue address.</p>
              <p className="signature">Aashish</p>
            </>
          )}

          {state === 'pending' && (
            <>
              <h1>Your payment hasn’t completed yet.</h1>
              <p>
                If you closed the payment page, you can try again. If money was taken from your account, don’t pay twice: WhatsApp me on{' '}
                <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappLabel}</a> with reference <strong>{orderId}</strong>.
              </p>
              <div className="thanks__actions">
                <Link className="btn btn--peach" to="/">Try booking again</Link>
              </div>
            </>
          )}

          {state === 'failed' && (
            <>
              <h1>Your payment didn’t go through.</h1>
              <p>No booking was made. You can try again, or WhatsApp me if anything looks wrong.</p>
              <div className="thanks__actions">
                <Link className="btn btn--peach" to="/">Try booking again</Link>
              </div>
            </>
          )}

          {state === 'unknown' && (
            <>
              <h1>We couldn’t confirm your payment just now.</h1>
              <p>
                If money was taken, your booking is safe. WhatsApp me on{' '}
                <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappLabel}</a> with reference <strong>{orderId}</strong> and I’ll confirm it.
              </p>
            </>
          )}
        </div>
      </main>
      <SiteFooter ask="Questions? WhatsApp me:" />
    </div>
  );
}
