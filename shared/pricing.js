// Session price in whole rupees. Set SESSION_PRICE_INR in Vercel (or .env locally)
// to change it; the page (at build) and the payment API (at runtime) both read it,
// so redeploy after changing it.
export const DEFAULT_PRICE_INR = 799;

export function parsePriceInr(raw) {
  if (raw === undefined || raw === '') return DEFAULT_PRICE_INR;
  const price = Number(raw);
  if (!Number.isInteger(price) || price < 1) {
    throw new Error(`SESSION_PRICE_INR must be a whole number of rupees, got "${raw}"`);
  }
  return price;
}

export const formatInr = (price) => `₹${price.toLocaleString('en-IN')}`;
