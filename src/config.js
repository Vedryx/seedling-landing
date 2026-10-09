// Session details shown across the site. Change them here only.
export const SESSION = {
  version: 'b',
  price: 799,
  priceLabel: '₹799',
  dates: '24th & 25th October 2026',
  venue: 'Society Club house, Masulkar colony, Pimpri, Pune',
  capacity: 'Up to 8 children per session',
  classes: [2, 3, 4, 5, 6, 7, 8],
};

export const CONTACT = {
  whatsappLabel: '+91-7069344301',
  whatsappUrl: 'https://wa.me/917069344301',
  email: 'theseedling.edu@gmail.com',
};

export const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE === 'production' ? 'production' : 'sandbox';
export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
